from app.agent.scoring import rank_offers
from app.schemas import Offer


def _offer(price=1000, duration=500, seat_categories=None, arrival="2026-08-22T05:00:00+03:00"):
    return Offer(
        offer_id=str(price),
        train_number=str(price),
        price=price,
        duration_min=duration,
        arrival_at=arrival,
        seat_categories=seat_categories or {},
    )


def test_empty():
    assert rank_offers([]) == []


def test_cheapest_first():
    a, b, c = _offer(1000), _offer(2000), _offer(3000)
    ranked = rank_offers([b, c, a])
    assert ranked[0][0].price == 1000
    assert [o.price for o, _, _ in ranked] == [1000, 2000, 3000]


def test_preferred_category_gets_bonus():
    # два поезда одинаковой цены, но у одного есть купе — он должен выиграть
    a = _offer(5000, seat_categories={"COMPARTMENT": 5000})
    b = _offer(5000, seat_categories={"RESERVED_SEAT": 2500})
    ranked = rank_offers([a, b], prefs={"seat_category": "COMPARTMENT"})
    assert ranked[0][0].offer_id == "5000"  # a, т.к. у него купе


def test_arrive_by_penalty():
    a = _offer(1000, arrival="2026-08-22T04:00:00+03:00")
    b = _offer(1000, arrival="2026-08-22T22:00:00+03:00")
    ranked = rank_offers([a, b], prefs={"arrive_by": "12:00"})
    assert ranked[0][0].arrival_at.startswith("2026-08-22T04:00")
