"""create_checkout_link → ссылка на покупку с выбранным местом.

checkout_ref из search_rail уже несёт все id, нужные для deeplink. Сюда
добавляются только car_number и seat_numbers, которые выбрал пользователь.
"""
from ..schemas import Checkout


async def create_checkout(
    mcp,
    checkout_ref: dict,
    car_number: str | None = None,
    seat_numbers: list[str] | None = None,
    fare_type: str | None = None,
) -> Checkout:
    args = {k: v for k, v in checkout_ref.items() if v is not None}
    if car_number is not None:
        args["car_number"] = car_number
    if seat_numbers:
        args["seat_numbers"] = seat_numbers
    if fare_type is not None:
        args["fare_type"] = fare_type
    result = await mcp.call_tool("create_checkout_link", args)
    return Checkout(
        url=result.get("checkout_url", ""),
        kind=result.get("kind", ""),
    )
