"""LLM-планировщик: из сообщения и состояния решает следующий шаг диалога.

Модель не вызывает инструменты сама (bothub без function-calling). Она возвращает
JSON-«шаг»: что сказать пользователю (reply), какие слоты обновить и какое
действие выполнить (ask/search/select/back/hotels/videos/smalltalk). Python
исполняет MCP-инструменты и хранит состояние.
"""
import json
import re
from datetime import date

from ..schemas import State
from .guard import HARDEN, MESSAGE_MAX, clean_text, sanitize_trip

_SYSTEM = (
    "Ты эмпатичный ассистент по планированию поездок. Пользователь описывает "
    "поездку свободной формой, ты решаешь следующий шаг и отвечаешь тёплым, "
    "конкретным языком.\n"
    "Отвечай ТОЛЬКО валидным JSON, без пояснений и markdown-блоков.\n"
    + HARDEN
)

_ACTION_GUIDE = (
    "Поле action — строго одно из:\n"
    "- ask: данных для поиска не хватает (откуда/куда/дата/сколько человек) или "
    "пользователь просто общается. Задай тёплый уточняющий вопрос в reply.\n"
    "- search: пользователь хочет найти билеты. В transport укажи rail (поезд), "
    "avia (самолёт) или any (не сказал — ищи оба варианта параллельно).\n"
    "- select: пользователь выбирает вариант из уже показанного списка.\n"
    "- back: пользователь хочет вернуться, отменить выбор или посмотреть другой вариант.\n"
    "- hotels: пользователь хочет отель или жильё в городе назначения.\n"
    "- videos: пользователь хочет посмотреть видео о направлении.\n"
    "- smalltalk: приветствие или вопрос не по делу.\n"
)

_SLOT_GUIDE = (
    "Слоты origin/destination/departure_date/passengers заполняй из сообщения, "
    "объединяя с текущими. Не упомянутое оставь null. Даты приводи к YYYY-MM-DD "
    "(завтра, послезавтра, «21 августа» считай от сегодня).\n"
    "Если пользователь называет число пассажиров, ставь passengers. Если тип вагона "
    "(купе/плацкарт/СВ/сидячий), бюджет «до N», время прибытия «к HH:MM» или «самое "
    "дешёвое» — заполняй preferences (seat_category/max_price/arrive_by/cheapest).\n"
    "ВАЖНО: если количество человек ещё не названо явно, при намерении искать "
    "сначала спроси «сколько вас едет?» (action=ask). Это критично для подбора.\n"
    "reply пиши на русском, без длинного тире и без стрелок, без эмодзи.\n"
)

_FORM = (
    "Верни JSON строго такой формы:\n"
    '{"reply": str, "action": "ask|search|select|back|hotels|videos|smalltalk", '
    '"transport": "rail|avia|any"|null, '
    '"origin": str|null, "destination": str|null, "departure_date": "YYYY-MM-DD"|null, '
    '"passengers": int|null, "preferences": {"seat_category": str|null, '
    '"max_price": int|null, "arrive_by": "HH:MM"|null, "cheapest": bool|null}}'
)


def _extract_json(text: str) -> dict:
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass
    return {}


def _offers_summary(state: State) -> str:
    if not state.offers:
        return "Вариантов пока не показано."
    items = []
    for o in state.offers[:6]:
        label = "Самолёт" if o.transport == "avia" else "Поезд"
        items.append(f"{label} {o.train_number}, {o.price:.0f} {o.currency}")
    return "; ".join(items)


async def plan(llm, state: State, message: str) -> dict:
    today = date.today().isoformat()
    message = clean_text(message, MESSAGE_MAX)
    trip = state.trip
    pax = f"{trip.passengers} (названо явно)" if trip.passengers_explicit else "неизвестно"

    user_prompt = (
        f"Сегодня {today}.\n"
        f"Текущие параметры: откуда={trip.origin or '?'}, куда={trip.destination or '?'}, "
        f"дата={trip.departure_date or '?'}, человек={pax}.\n"
        f"Показанные варианты: {_offers_summary(state)}\n"
        f"Выбранный вариант: {state.selected_offer.train_number if state.selected_offer else 'нет'}.\n"
        f"Этап: {state.stage}.\n"
        f"Сообщение пользователя: «{message}»\n\n"
        + _ACTION_GUIDE
        + _SLOT_GUIDE
        + _FORM
    )
    content = await llm.complete(
        [{"role": "system", "content": _SYSTEM}, {"role": "user", "content": user_prompt}],
        max_tokens=500,
    )
    raw = _extract_json(content)
    if not raw:
        return {}

    action = raw.get("action") or "ask"
    if action not in {"ask", "search", "select", "back", "hotels", "videos", "smalltalk"}:
        action = "ask"
    transport = raw.get("transport")
    if transport not in {"rail", "avia", "any"}:
        transport = None

    reply = (raw.get("reply") or "").strip()
    if not reply:
        reply = "Понял, сейчас сориентируюсь."

    return {
        "reply": reply,
        "action": action,
        "transport": transport,
        "trip": sanitize_trip(raw),
    }
