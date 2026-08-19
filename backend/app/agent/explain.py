"""Объяснение выбора — «почему этот поезд/место»."""
from ..schemas import Offer, Trip
from .guard import HARDEN, CITY_MAX, DATE_MAX, sanitize_field, sanitize_seat_numbers


def _hhmm(iso: str) -> str:
    # "2026-08-21T13:15:00+03:00" -> "13:15"
    return iso[11:16] if len(iso) >= 16 else iso


async def explain_choice(llm, trip: Trip, offer: Offer, seat_numbers: list[str] | None = None) -> str:
    h, m = divmod(offer.duration_min, 60)
    cats = ", ".join(f"{c} от {p:.0f} ₽" for c, p in offer.seat_categories.items())

    # User-производные поля чистим повторно (defense in depth): даже если что-то
    # грязное просочилось мимо intent-валидации, в промпт объяснения это не попадёт.
    origin = sanitize_field(trip.origin, CITY_MAX) or "не указано"
    destination = sanitize_field(trip.destination, CITY_MAX) or "не указано"
    departure_date = sanitize_field(trip.departure_date, DATE_MAX) or "не указана"
    seats = sanitize_seat_numbers(seat_numbers)
    label = "рейс" if offer.transport == "avia" else "поезд"

    prompt = (
        f"Пользователь спланировал поездку {origin} в {destination} "
        f"на {departure_date}, пассажиров {trip.passengers}.\n"
        f"Выбран {label} {offer.train_number} ({offer.carrier}): "
        f"отправление {_hhmm(offer.departure_at)}, прибытие {_hhmm(offer.arrival_at)}, "
        f"в пути {h} ч {m} мин, цена {offer.price} {offer.currency}.\n"
        f"Типы вагонов и цены: {cats or 'не указаны'}.\n"
        + (f"Выбранные места: {', '.join(seats)}.\n" if seats else "")
        + "Напиши 2-3 предложения, почему этот вариант подходит. "
        "Опирайся только на факты выше. Не называй поезд ночным или дневным, "
        "если время отправления этого не подтверждает. Не добавляй фактов, которых нет "
        "в данных. По-русски, конкретно, без воды."
    )
    return await llm.complete(
        [
            {"role": "system", "content": HARDEN},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
    )
