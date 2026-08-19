"""Фолбэки при падении MCP / bothub — сервис продолжает отвечать осмысленно."""
from ..schemas import Offer

MCP_DOWN = "Поиск билетов сейчас недоступен - сервис Туту не отвечает. Попробуй ещё раз через минуту."
LLM_DOWN = "Билеты подберу, но объяснение выбора временно недоступно."


def fallback_explanation(offer: Offer) -> str:
    """Детерминированная замена LLM-объяснения, если bothub упал."""
    h, m = divmod(offer.duration_min, 60)
    label = "Рейс" if offer.transport == "avia" else "Поезд"
    return (
        f"{label} {offer.train_number}: {offer.price} {offer.currency}, "
        f"в пути {h} ч {m} мин, отправление {offer.departure_at[11:16]}."
    )
