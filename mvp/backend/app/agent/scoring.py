"""Детерминированное ранжирование офферов. Чистая функция без сети — юнит-тесты.

Возвращает список (offer, score, reasons) по убыванию score. reasons — факторы,
которые реально повлияли, из них потом строится объяснение.
"""
from ..schemas import Offer


def _effective_price(offer: Offer, want_category: str) -> float:
    """Цена нужной категории вагона, если она задана и есть; иначе общая."""
    if want_category and want_category in offer.seat_categories:
        return offer.seat_categories[want_category]
    return offer.price


def rank_offers(offers: list[Offer], prefs: dict | None = None) -> list[tuple[Offer, float, list[str]]]:
    prefs = prefs or {}
    want_category = (prefs.get("seat_category") or "").upper()
    arrive_by = prefs.get("arrive_by")  # "HH:MM"
    max_price = prefs.get("max_price")

    if not offers:
        return []

    prices = [_effective_price(o, want_category) for o in offers]
    durations = [o.duration_min for o in offers]
    lo_p, hi_p = min(prices), max(prices)
    lo_d, hi_d = min(durations), max(durations)

    scored: list[tuple[Offer, float, list[str]]] = []
    for o in offers:
        p = _effective_price(o, want_category)
        price_norm = (p - lo_p) / (hi_p - lo_p) if hi_p > lo_p else 0.0
        dur_norm = (o.duration_min - lo_d) / (hi_d - lo_d) if hi_d > lo_d else 0.0

        reasons: list[str] = []
        score = 0.0
        score -= 0.5 * price_norm
        score -= 0.3 * dur_norm

        if p == lo_p:
            reasons.append("самая низкая цена")
        if o.duration_min == lo_d:
            reasons.append("самый короткий в пути")

        if arrive_by and o.arrival_at:
            arr_hm = o.arrival_at[11:16]  # ISO "2026-08-22T05:01:00+03:00" -> "05:01"
            if arr_hm > arrive_by:
                score -= 0.4
                reasons.append(f"прибывает позже {arrive_by}")
            else:
                reasons.append(f"прибывает до {arrive_by}")

        if max_price and p > max_price:
            score -= 1.0
            reasons.append(f"дороже лимита {max_price}")

        if want_category and want_category in o.seat_categories:
            score += 0.2
            reasons.append(f"есть вагон {want_category}")

        if o.review_rating:
            score += 0.1 * (o.review_rating / 10.0)

        scored.append((o, score, reasons))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored
