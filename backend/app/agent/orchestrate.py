"""Ядро: LLM-планировщик поверх MCP.

Каждая реплика пользователя идёт в planner: модель возвращает JSON-шаг (что
сказать, какие слоты обновить, какое действие выполнить). Python исполняет
MCP-инструменты (поиск поездов/самолётов/отелей, схема вагона, checkout) и
хранит состояние. При падении bothub - детерминированный фолбэк.
"""
import asyncio
import uuid
from collections.abc import Awaitable, Callable

from ..llm import LLMError
from ..mcp import MCPError
from ..schemas import Offer, State
from ..services import checkout, memory, search, seatmap, videos
from . import degrade, explain, planner, scoring

# Колбэк прогресса для стриминга: текст этапа → await.
StatusFn = Callable[[str], Awaitable[None]] | None


class Orchestrator:
    def __init__(self, mcp, llm):
        self.mcp = mcp
        self.llm = llm
        self.sessions: dict[str, State] = {}

    async def new_session(self) -> str:
        sid = uuid.uuid4().hex
        self.sessions[sid] = State()
        return sid

    def _state(self, sid: str) -> State | None:
        return self.sessions.get(sid)

    @staticmethod
    async def _emit(on_status: StatusFn, text: str) -> None:
        if on_status is not None:
            await on_status(text)

    # ---- входные точки ----

    async def handle_message(
        self, sid: str, message: str, on_status: StatusFn = None
    ) -> tuple[str, State]:
        state = self._state(sid)
        if state is None:
            return "Сессия не найдена. Начни заново.", State(stage="error")

        await self._emit(on_status, "Понимаю запрос…")
        step = await self._plan(state, message)
        if step is None:
            return await self._legacy_step(state, message, on_status)

        self._merge_slots(state, step)
        action = step.get("action", "ask")
        reply = step.get("reply", "")

        if action in ("ask", "smalltalk"):
            if not state.trip.is_searchable():
                state.stage = "clarifying"
            return reply, state

        if action == "back":
            return self._go_back(state, reply)

        if action == "hotels":
            return await self._search_hotels(state, on_status)

        if action == "videos":
            return await self._search_videos(state, on_status)

        if action == "search":
            if not state.trip.is_searchable():
                missing = ", ".join(state.trip.missing_fields())
                state.stage = "clarifying"
                return f"{reply}\n\nУточни: {missing}.", state
            return await self._search(state, step.get("transport"), on_status)

        if action == "select":
            return await self._select_offer(state, message, on_status)

        return reply, state

    async def select_seat(
        self,
        sid: str,
        car_number: str | None = None,
        seat_numbers: list[str] | None = None,
        on_status: StatusFn = None,
    ) -> tuple[str, State]:
        state = self._state(sid)
        if state is None or state.selected_offer is None:
            return "Сначала выбери поезд.", state or State(stage="error")

        offer = state.selected_offer
        await self._emit(on_status, "Собираю корзину…")
        try:
            state.checkout = await checkout.create_checkout(
                self.mcp, offer.checkout_ref, car_number=car_number, seat_numbers=seat_numbers
            )
        except MCPError:
            return degrade.MCP_DOWN, state

        await self._emit(on_status, "Составляю объяснение…")
        try:
            state.explanation = await explain.explain_choice(
                self.llm, state.trip, offer, seat_numbers
            )
        except LLMError:
            state.explanation = degrade.fallback_explanation(offer)

        state.stage = "checkout"
        reply = f"## Готово\n\n{state.explanation}"
        if state.checkout.url:
            reply += f"\n\n[Перейти к покупке]({state.checkout.url})"
        reply += self._hotel_offer(state)
        return reply, state

    # ---- планировщик и слоты ----

    async def _plan(self, state: State, message: str) -> dict | None:
        try:
            step = await planner.plan(self.llm, state, message)
        except LLMError:
            return None  # bothub упал — дальше детерминированный фолбэк
        if not step:
            # модель вернула не-JSON: безопасный шаг «уточнить»
            return {"reply": "Уточни, пожалуйста, что имеешь в виду.", "action": "ask"}
        return step

    def _merge_slots(self, state: State, step: dict) -> None:
        t = step.get("trip") or {}
        trip = state.trip
        if t.get("origin"):
            trip.origin = t["origin"]
        if t.get("destination"):
            trip.destination = t["destination"]
        if t.get("departure_date"):
            trip.departure_date = t["departure_date"]
        if t.get("passengers"):
            trip.passengers = t["passengers"]
            trip.passengers_explicit = True
        if t.get("preferences"):
            merged = {**trip.preferences, **t["preferences"]}
            trip.preferences = {k: v for k, v in merged.items() if v not in (None, "")}

    # ---- действия ----

    async def _search(self, state: State, transport: str | None, on_status: StatusFn = None):
        await self._emit(on_status, "Ищу билеты…")
        modes = transport if transport in ("rail", "avia") else ("rail", "avia")
        results = await asyncio.gather(*[self._search_mode(state, m) for m in modes])
        offers = [o for sub in results for o in sub[0]]
        errored = [sub[1] for sub in results]

        if not offers:
            if all(errored):
                state.stage = "error"
                return degrade.MCP_DOWN, state
            state.stage = "done"
            return "По этому маршруту на дату билетов не нашлось. Попробуй другую дату или город.", state

        ranked = scoring.rank_offers(offers, self._effective_prefs(state))
        state.offers = [o for o, _, _ in ranked]
        state.stage = "results"
        state.memory = memory.record_trip(state.trip)
        return self._format_offers_reply(state.offers), state

    async def _search_mode(self, state: State, mode: str) -> tuple[list[Offer], bool]:
        try:
            if mode == "avia":
                raw = await search.search_avia(self.mcp, state.trip)
                return search.offers_from_avia(raw), False
            raw = await search.search_rail(self.mcp, state.trip)
            return search.offers_from_rail(raw), False
        except MCPError:
            return [], True

    def _effective_prefs(self, state: State) -> dict:
        """Явные пожелания пользователя поверх агрегата копилки опыта."""
        prefs = dict(state.trip.preferences or {})
        mem = (state.memory or {}).get("preferences") or {}
        for k in ("seat_category", "max_price"):
            if not prefs.get(k):
                prefs[k] = mem.get(k)
        return prefs

    def _format_offers_reply(self, offers: list[Offer]) -> str:
        lines = [f"## Найдено вариантов: {len(offers)}", "", "Отсортировано по цене и времени:"]
        for i, o in enumerate(offers[:6], 1):
            h, m = divmod(o.duration_min, 60)
            label = "Самолёт" if o.transport == "avia" else "Поезд"
            dep = o.departure_at[11:16] if len(o.departure_at) >= 16 else o.departure_at
            arr = o.arrival_at[11:16] if len(o.arrival_at) >= 16 else o.arrival_at
            lines.append(
                f"{i}. **{label} {o.train_number}** · {dep} - {arr} ({h} ч {m} мин) · **{o.price:.0f} {o.currency}**"
            )
        lines.append("")
        lines.append("Напиши номер варианта, «дешёвый» или «быстрый». Нужен только самолёт или только поезд - так и скажи.")
        return "\n".join(lines)

    async def _select_offer(self, state: State, message: str, on_status: StatusFn = None):
        idx = parse_offer_selection(message, state.offers)
        if idx is None:
            return "Уточни, какой вариант выбираешь: номер или «дешёвый/быстрый».", state

        offer = state.offers[idx]
        state.selected_offer = offer
        if offer.transport == "avia":
            return await self._checkout_avia(state, offer, on_status)
        return await self._load_seatmap(state, on_status)

    async def _checkout_avia(self, state: State, offer: Offer, on_status: StatusFn = None):
        await self._emit(on_status, "Собираю ссылку на билет…")
        try:
            state.checkout = await checkout.create_checkout(self.mcp, offer.checkout_ref)
        except MCPError:
            return degrade.MCP_DOWN, state

        await self._emit(on_status, "Составляю объяснение…")
        try:
            state.explanation = await explain.explain_choice(self.llm, state.trip, offer)
        except LLMError:
            state.explanation = degrade.fallback_explanation(offer)

        state.stage = "checkout"
        reply = f"## Готово\n\n{state.explanation}"
        if state.checkout.url:
            reply += f"\n\n[Перейти к покупке]({state.checkout.url})"
        reply += self._hotel_offer(state)
        return reply, state

    async def _load_seatmap(self, state: State, on_status: StatusFn = None):
        offer = state.selected_offer
        await self._emit(on_status, "Подбираю вагоны и места…")
        try:
            raw = await seatmap.get_seatmap(self.mcp, offer.details_ref)
        except MCPError:
            state.stage = "checkout"
            return (
                f"Поезд {offer.train_number}. Схема вагона недоступна, "
                "но можно сразу перейти к покупке - выбери место в корзине Туту.",
                state,
            )

        state.seatmap = seatmap.seatmap_from_raw(raw)
        if state.seatmap.total_free == 0:
            state.seatmap = None
            state.selected_offer = None
            state.stage = "results"
            return (
                f"Поезд {offer.train_number}: свободных мест нет. "
                "Выбери другой поезд из списка.",
                state,
            )
        state.stage = "seatmap"

        cats = ", ".join(f"{c} от {p:.0f} ₽" for c, p in offer.seat_categories.items()) or "тарифы уточняйте на сайте"
        free = state.seatmap.total_free
        reply = (
            f"## Поезд {offer.train_number}\n\n"
            f"**{offer.price:.0f} {offer.currency}** · в пути "
            f"{offer.duration_min // 60} ч {offer.duration_min % 60} мин\n\n"
            f"Типы вагонов: {cats}\n\n"
            f"Свободно **{free} мест** в {len(state.seatmap.cars)} вагонах."
        )
        best = max(state.seatmap.cars, key=lambda c: len(c.seats), default=None)
        if best:
            nums = ", ".join(s.number for s in best.seats)
            reply += f"\n\nВагон **{best.car_number}** ({best.car_type}): места {nums}."
        reply += "\n\nВыбери вагон и место на схеме. Вернуться к списку - напиши «назад»."
        return reply, state

    async def _search_hotels(self, state: State, on_status: StatusFn = None):
        if not state.trip.destination:
            return "Сначала уточни, куда едете, - тогда подберу отель.", state
        await self._emit(on_status, "Ищу отели…")
        try:
            raw = await search.search_hotels(self.mcp, state.trip)
        except MCPError:
            return degrade.MCP_DOWN, state

        hotels = search.hotels_from_raw(raw)
        if not hotels:
            return f"Отелей в {state.trip.destination} на эти даты не нашлось.", state

        state.hotels = hotels
        lines = [f"## Отели в {state.trip.destination}", ""]
        for i, h in enumerate(hotels, 1):
            stars = "★" * h.stars
            rating = f"{h.rating:.1f}" if h.rating is not None else "нет оценки"
            fc = " · бесплатная отмена" if h.free_cancellation else ""
            lines.append(
                f"{i}. **{h.name}** {stars} ({rating}) · {h.price:.0f} {h.currency} за проживание{fc}"
            )
        lines.append("")
        lines.append("Напиши номер отеля - дам ссылку на бронирование.")
        return "\n".join(lines), state

    async def _search_videos(self, state: State, on_status: StatusFn = None):
        if not state.trip.destination:
            return "Сначала уточни, куда едете, - тогда подберу видео.", state
        await self._emit(on_status, "Ищу видео о направлении…")
        vids = await videos.search_videos(state.trip.destination)
        if not vids:
            return (
                f"Видео о {state.trip.destination} не нашлись "
                "(YouTube может не отвечать с этого сервера).",
                state,
            )
        state.videos = vids
        lines = [f"## Видео о {state.trip.destination}", ""]
        for v in vids:
            lines.append(f"- [{v.title}]({v.url}) · {v.channel}")
        return "\n".join(lines), state

    def _go_back(self, state: State, reply: str):
        state.selected_offer = None
        state.seatmap = None
        state.checkout = None
        state.explanation = None
        if state.offers:
            state.stage = "results"
            return reply + "\n\n" + self._format_offers_reply(state.offers), state
        state.stage = "clarifying"
        return reply, state

    def _hotel_offer(self, state: State) -> str:
        if state.trip.destination:
            return f"\n\nНужен отель в {state.trip.destination}? Напиши «отель» - подберу."
        return ""

    # ---- детерминированный фолбэк при падении bothub ----

    async def _legacy_step(self, state: State, message: str, on_status: StatusFn = None):
        if not state.trip.is_searchable():
            state.stage = "clarifying"
            return "Сервис понимания запросов временно недоступен. Назови: откуда, куда, на какую дату и сколько человек.", state
        if not state.offers:
            return await self._search(state, "rail", on_status)
        if state.selected_offer is None:
            return await self._select_offer(state, message, on_status)
        if state.seatmap is None:
            return await self._load_seatmap(state, on_status)
        return "Выбери место на схеме.", state


def parse_offer_selection(message: str, offers: list[Offer]) -> int | None:
    """Понимает выбор варианта: номер поезда/рейса, порядковый номер, «дешёвый/быстрый»."""
    m = message.lower().strip()
    if not offers:
        return None

    for i, o in enumerate(offers):
        tn = (o.train_number or "").lower()
        if tn and tn in m:
            return i

    ordinals = {
        "первый": 0, "первое": 0, "перв": 0, "1": 0,
        "второй": 1, "второе": 1, "втор": 1, "2": 1,
        "третий": 2, "третье": 2, "трет": 2, "3": 2,
        "четвёртый": 3, "четвертый": 3, "4": 3,
        "пятый": 4, "5": 4,
    }
    for word, idx in ordinals.items():
        if word in m:
            return idx if idx < len(offers) else None

    if "дешёв" in m or "дешев" in m:
        return min(range(len(offers)), key=lambda i: offers[i].price)
    if "быстр" in m:
        return min(range(len(offers)), key=lambda i: offers[i].duration_min)
    return None
