"""Обёртки над MCP search_rail/search_avia/search_hotels и нормализация в Offer/Hotel."""
from ..schemas import Hotel, Offer, Trip


async def search_rail(mcp, trip: Trip, page_size: int = 10) -> dict:
    args = {
        "origin": trip.origin,
        "destination": trip.destination,
        "departure_date": trip.departure_date,
        "passengers": trip.passengers,
        "page": 1,
        "page_size": page_size,
        "sort": "price_asc",
        "view": "compact",
    }
    return await mcp.call_tool("search_rail", args)


async def search_avia(mcp, trip: Trip, page_size: int = 6) -> dict:
    args = {
        "origin": trip.origin,
        "destination": trip.destination,
        "departure_date": trip.departure_date,
        "adults": trip.passengers,
        "page": 1,
        "page_size": page_size,
        "sort": "price_asc",
    }
    return await mcp.call_tool("search_avia", args)


async def search_hotels(mcp, trip: Trip, page_size: int = 3) -> dict:
    from datetime import date, timedelta

    check_in = trip.departure_date
    try:
        check_out = (date.fromisoformat(check_in) + timedelta(days=2)).isoformat()
    except (TypeError, ValueError):
        check_out = check_in
    args = {
        "city_name": trip.destination,
        "check_in": check_in,
        "check_out": check_out,
        "adults": trip.passengers,
        "page": 1,
        "page_size": page_size,
    }
    return await mcp.call_tool("search_hotels", args)


def offers_from_rail(raw: dict) -> list[Offer]:
    out: list[Offer] = []
    for o in raw.get("offers", []) or []:
        price = o.get("price") or {}
        fares = o.get("fares") or {}
        seat_cats = {
            k: v.get("price_from", 0)
            for k, v in (fares.get("seat_categories") or {}).items()
        }
        cref = o.get("checkout_ref") or {}
        dref = o.get("details_ref") or {}
        out.append(
            Offer(
                offer_id=o.get("offer_id", ""),
                transport=o.get("transport", "railway"),
                carrier=(o.get("carriers") or [""])[0],
                train_number=cref.get("train_number") or dref.get("train_number", ""),
                departure_at=o.get("departure_at", ""),
                arrival_at=o.get("arrival_at", ""),
                duration_min=o.get("duration_min", 0),
                price=price.get("amount", 0),
                currency=price.get("currency", "RUB"),
                seat_categories=seat_cats,
                review_rating=(o.get("review_summary") or {}).get("rating"),
                checkout_ref=cref,
                details_ref=dref,
            )
        )
    return out


def offers_from_avia(raw: dict) -> list[Offer]:
    """Авиа-офферы: рейс из legs[0].segments[0].voyage_no, тарифы из variants[].fare_family."""
    out: list[Offer] = []
    for o in raw.get("offers", []) or []:
        price = o.get("price") or {}
        cref = o.get("checkout_ref") or {}

        voyage = ""
        try:
            voyage = o["legs"][0]["segments"][0].get("voyage_no", "")
        except (KeyError, IndexError, TypeError):
            voyage = ""

        fares: dict[str, float] = {}
        for v in o.get("variants", []) or []:
            fam = (v.get("conditions") or {}).get("fare_family")
            vp = (v.get("price") or {}).get("amount")
            if fam and isinstance(vp, (int, float)):
                fares[fam] = float(vp)

        out.append(
            Offer(
                offer_id=o.get("offer_id", ""),
                transport="avia",
                carrier=(o.get("carriers") or [""])[0],
                train_number=voyage,
                departure_at=o.get("departure_at", ""),
                arrival_at=o.get("arrival_at", ""),
                duration_min=o.get("duration_min", 0),
                price=price.get("amount", 0),
                currency=price.get("currency", "RUB"),
                seat_categories=fares,
                review_rating=(o.get("review_summary") or {}).get("rating"),
                checkout_ref=cref,
                details_ref={},
            )
        )
    return out


def hotels_from_raw(raw: dict) -> list[Hotel]:
    """Отели: имя, звёзды, рейтинг, лучший номер с ценой за проживание и ссылкой."""
    out: list[Hotel] = []
    for h in raw.get("hotels", []) or []:
        bo = h.get("best_offer") or {}
        p = bo.get("price") or {}
        out.append(
            Hotel(
                hotel_id=str(h.get("hotel_id", "")),
                name=(h.get("name") or "").strip(),
                stars=h.get("stars") or 0,
                rating=(h.get("review_summary") or {}).get("rating"),
                review_count=(h.get("review_summary") or {}).get("review_count") or 0,
                address=h.get("address") or "",
                photo=(h.get("photos") or [""])[0],
                room_name=bo.get("room_name") or "",
                price=p.get("amount", 0),
                currency=p.get("currency", "RUB"),
                price_basis=bo.get("price_basis") or "stay_total",
                free_cancellation=bool(bo.get("free_cancellation")),
                checkout_url=bo.get("checkout_url") or h.get("checkout_url") or "",
                checkout_ref=h.get("checkout_ref") or {},
            )
        )
    return out
