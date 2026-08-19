"""API-контракт: состояние плана поездки (state), которое фронт рендерит.

Это единственный контракт между бэкендом и React-фронтом. Все поля, которые
фронт рисует, лежат здесь. Сырые MCP-данные (checkout_ref, details_ref)
хранятся в Offer, но не выносятся в открытый ответ, чтобы не путать Рустама.
"""
from pydantic import BaseModel, Field


class Trip(BaseModel):
    origin: str | None = None
    destination: str | None = None
    departure_date: str | None = None  # YYYY-MM-DD
    passengers: int = 1
    passengers_explicit: bool = False  # назвал ли пользователь число пассажиров явно
    preferences: dict = Field(default_factory=dict)

    def is_searchable(self) -> bool:
        return bool(self.origin and self.destination and self.departure_date)

    def missing_fields(self) -> list[str]:
        missing = []
        if not self.origin:
            missing.append("откуда едем")
        if not self.destination:
            missing.append("куда едем")
        if not self.departure_date:
            missing.append("на какую дату")
        return missing


class Offer(BaseModel):
    offer_id: str
    transport: str = "railway"
    carrier: str = ""
    train_number: str = ""
    departure_at: str = ""
    arrival_at: str = ""
    duration_min: int = 0
    price: float = 0
    currency: str = "RUB"
    # категория вагона -> минимальная цена (SEDENTARY/RESERVED_SEAT/COMPARTMENT/LUX)
    seat_categories: dict[str, float] = Field(default_factory=dict)
    review_rating: float | None = None
    # служебные поля для MCP, наружу не отдаются
    checkout_ref: dict = Field(default_factory=dict, exclude=True)
    details_ref: dict = Field(default_factory=dict, exclude=True)


class Seat(BaseModel):
    """Свободное место. MCP отдаёт только свободные места, занятых в ответе нет.

    type — открытый словарь: UPPER / LOWER / SIDE_UPPER / SIDE_LOWER /
    SEDENTARY / UPPER_NEAR_WC ... Матчить по префиксу, не по равенству.
    """
    number: str
    type: str = ""
    compartment_number: int | None = None
    deck: str | None = None  # 'LOWER_DECK'/'UPPER_DECK' для двухэтажного, None для одноэтажного
    gender: str = ""  # NO_GENDER / FEMALE / MALE / MIXED
    level: str | None = None  # top / bottom
    distance_to_nearest_wc_px: float | None = None


class Car(BaseModel):
    car_number: str
    car_type: str = ""
    seats: list[Seat] = Field(default_factory=list)


class Seatmap(BaseModel):
    cars: list[Car] = Field(default_factory=list)
    total_free: int = 0


class Checkout(BaseModel):
    url: str
    kind: str


class Hotel(BaseModel):
    hotel_id: str = ""
    name: str = ""
    stars: int = 0
    rating: float | None = None
    review_count: int = 0
    address: str = ""
    photo: str = ""
    room_name: str = ""
    price: float = 0
    currency: str = "RUB"
    price_basis: str = "stay_total"  # stay_total = цена за всё проживание, не за ночь
    free_cancellation: bool = False
    checkout_url: str = ""
    checkout_ref: dict = Field(default_factory=dict, exclude=True)


class Video(BaseModel):
    video_id: str = ""
    title: str = ""
    channel: str = ""
    duration: str = ""
    thumbnail: str = ""
    url: str = ""


class State(BaseModel):
    stage: str = "greeting"  # greeting|clarifying|results|seatmap|checkout|done|error
    trip: Trip = Field(default_factory=Trip)
    offers: list[Offer] = Field(default_factory=list)
    selected_offer: Offer | None = None
    seatmap: Seatmap | None = None
    checkout: Checkout | None = None
    explanation: str | None = None
    hotels: list[Hotel] = Field(default_factory=list)
    videos: list[Video] = Field(default_factory=list)
    memory: dict = Field(default_factory=dict)  # агрегат «копилки опыта» для показа
