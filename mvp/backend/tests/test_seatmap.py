from app.services.seatmap import seatmap_from_raw


def test_deck_coerced_to_string():
    raw = {
        "cars": [
            {
                "car_number": "7",
                "car_type": "Купе",
                "seats": [
                    {
                        "number": "25",
                        "type": "LOWER",
                        "compartment_number": 7,
                        "deck": "LOWER_DECK",
                        "gender": "MIXED",
                        "level": "bottom",
                        "distance_to_nearest_wc_px": 400,
                    }
                ],
            }
        ]
    }
    seatmap = seatmap_from_raw(raw)
    seat = seatmap.cars[0].seats[0]
    assert seat.deck == "LOWER_DECK"


def test_deck_none_for_single_decker():
    raw = {
        "cars": [
            {
                "car_number": "3",
                "car_type": "Плацкарт",
                "seats": [
                    {
                        "number": "1",
                        "type": "SIDE_LOWER",
                        "compartment_number": None,
                        "deck": None,
                        "gender": "NO_GENDER",
                        "level": None,
                        "distance_to_nearest_wc_px": None,
                    }
                ],
            }
        ]
    }
    seatmap = seatmap_from_raw(raw)
    assert seatmap.cars[0].seats[0].deck is None
