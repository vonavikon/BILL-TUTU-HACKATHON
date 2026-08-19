from app.agent.orchestrate import parse_offer_selection
from app.schemas import Offer


def _offers(*train_numbers):
    return [
        Offer(offer_id=str(i), train_number=t, price=1000 + i, duration_min=500 + i)
        for i, t in enumerate(train_numbers)
    ]


def test_by_train_number():
    offers = _offers("274Х", "118Н", "060М")
    assert parse_offer_selection("беру 118Н", offers) == 1
    assert parse_offer_selection("поезд 060М подойдёт", offers) == 2


def test_by_ordinal():
    offers = _offers("274Х", "118Н", "060М")
    assert parse_offer_selection("давай первый", offers) == 0
    assert parse_offer_selection("третий", offers) == 2


def test_by_keyword():
    offers = _offers("274Х", "118Н")  # 274Х дешевле, 118Н быстрее
    offers[0].duration_min = 600
    offers[1].duration_min = 400
    assert parse_offer_selection("самый дешёвый", offers) == 0
    assert parse_offer_selection("самый быстрый", offers) == 1


def test_unknown():
    offers = _offers("274Х", "118Н")
    assert parse_offer_selection("не знаю", offers) is None
