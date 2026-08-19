"""Копилка опыта: накопленные пожелания поездок в JSON-файле на диске.

Демонстрация «общей копилки» для прототипа: каждое пожелание пользователя
дописывается в общий файл, агрегат (самый частый тип вагона, медиана бюджета)
возвращается в State.memory для показа и подставляется дефолтом в ранжирование,
если пользователь в этот раз ничего не уточнил.
"""
import json
from collections import Counter
from pathlib import Path

_DEFAULT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "memory.json"


def load_memory(path: str | Path | None = None) -> dict:
    p = Path(path) if path else _DEFAULT_PATH
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"preferences": {}, "trips": []}


def _aggregate(trips: list[dict]) -> dict:
    cats: Counter = Counter()
    prices: list[int] = []
    for t in trips:
        pr = t.get("preferences") or {}
        if pr.get("seat_category"):
            cats[pr["seat_category"]] += 1
        if isinstance(pr.get("max_price"), int):
            prices.append(pr["max_price"])
    agg: dict = {}
    if cats:
        agg["seat_category"] = cats.most_common(1)[0][0]
    if prices:
        agg["max_price"] = sorted(prices)[len(prices) // 2]
    return agg


def record_trip(trip, path=None) -> dict:
    """Дописывает поездку в копилку, пересчитывает агрегат и возвращает его."""
    p = Path(path) if path else _DEFAULT_PATH
    mem = load_memory(p)
    trips = list(mem.get("trips", []))
    trips.append(
        {
            "origin": trip.origin,
            "destination": trip.destination,
            "departure_date": trip.departure_date,
            "passengers": trip.passengers,
            "preferences": trip.preferences or {},
        }
    )
    updated = {"preferences": _aggregate(trips), "trips": trips[-20:]}
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError:
        pass
    return updated
