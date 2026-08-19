"""get_rail_seatmap → нормализованная схема вагонов (Seatmap).

MCP отдаёт только свободные места: занятых мест в ответе нет, поэтому
Seatmap.cars — это список вагонов, в каждом — свободные места.
"""
from ..schemas import Car, Seat, Seatmap


async def get_seatmap(mcp, details_ref: dict, car_number: str | None = None) -> dict:
    args: dict = {"details_ref": details_ref, "view": "compact"}
    if car_number:
        args["car_number"] = car_number
    return await mcp.call_tool("get_rail_seatmap", args)


def seatmap_from_raw(raw: dict, car_number: str | None = None) -> Seatmap:
    cars = raw.get("cars") or []

    result: list[Car] = []
    for c in cars:
        if car_number and str(c.get("car_number")) != str(car_number):
            continue
        seats = c.get("seats") or []
        if not seats:
            continue
        result.append(
            Car(
                car_number=str(c.get("car_number", "")),
                car_type=c.get("car_type", ""),
                seats=[
                    Seat(
                        number=str(s.get("number", "")),
                        type=s.get("type") or "",
                        compartment_number=s.get("compartment_number"),
                        deck=str(s["deck"]) if s.get("deck") is not None else None,
                        gender=s.get("gender") or "",
                        level=s.get("level"),
                        distance_to_nearest_wc_px=s.get("distance_to_nearest_wc_px"),
                    )
                    for s in seats
                ],
            )
        )

    return Seatmap(cars=result, total_free=sum(len(c.seats) for c in result))
