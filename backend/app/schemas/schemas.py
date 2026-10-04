"""Pydantic contracts. Frontend consumes only these normalized shapes."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UserOut(BaseModel):
    id: UUID
    email: str
    name: str
    role: str = "USER"


class RegisterIn(BaseModel):
    email: str
    name: str
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TripCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    origin: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    travellers: int = Field(default=2, ge=1, le=20)


class TripUpdate(BaseModel):
    name: str | None = None
    origin: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    travellers: int | None = Field(default=None, ge=1, le=20)
    status: str | None = None


class TripOut(BaseModel):
    id: UUID
    name: str
    origin: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    travellers: int
    status: str
    total_amount: int
    currency: str = "INR"
    created_at: datetime


class DestinationAdd(BaseModel):
    destination_slug: str


class ItineraryAdd(BaseModel):
    day: int = Field(ge=1, le=60)
    kind: str  # transport|hotel|activity|restaurant
    title: str
    details: str | None = None
    amount: int = Field(default=0, ge=0)


class ItineraryPatch(BaseModel):
    day: int | None = Field(default=None, ge=1, le=60)
    title: str | None = None
    details: str | None = None
    amount: int | None = Field(default=None, ge=0)


class TransportAdd(BaseModel):
    kind: str  # flight|train|cab
    provider: str = "demo"
    offer_id: str
    title: str
    amount: int = Field(ge=0)


class HotelAdd(BaseModel):
    provider: str = "demo"
    offer_id: str
    name: str
    amount: int = Field(ge=0)


class ActivityAdd(BaseModel):
    title: str
    amount: int = Field(default=0, ge=0)


# ---- Normalized offers (provider-agnostic) ----

class FlightOffer(BaseModel):
    id: str
    provider: str
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure: str
    arrival: str
    duration_minutes: int
    stops: int
    baggage_kg: int = 15
    fare: int
    currency: str = "INR"
    refundable: bool = True
    seat_available: bool = True
    is_demo: bool = True


class TrainOffer(BaseModel):
    id: str
    provider: str
    train_number: str
    train_name: str
    origin: str
    destination: str
    departure: str
    arrival: str
    duration_minutes: int
    travel_class: str
    fare: int
    currency: str = "INR"
    availability: str = "Available"
    running_days: list[str] = Field(default_factory=list)
    is_demo: bool = True


class HotelOffer(BaseModel):
    id: str
    provider: str
    name: str
    destination: str
    location: str
    rating: float = 4.0
    room_type: str = "Deluxe Room"
    amenities: list[str] = Field(default_factory=list)
    price_per_night: int
    total_price: int
    currency: str = "INR"
    cancellation_policy: str = "Free cancellation"
    meal_plan: str = "Breakfast included"
    is_demo: bool = True


class CabOffer(BaseModel):
    id: str
    provider: str
    vehicle_type: str
    vehicle_model: str
    capacity: int
    luggage: int = 2
    included_km: int
    extra_km_price: int
    driver_rating: float = 4.8
    price: int
    currency: str = "INR"
    cancellation_policy: str = "Free cancellation up to 2 hours"
    is_demo: bool = True


class SearchRequest(BaseModel):
    type: str  # flight|train|hotel|cab
    origin: str | None = None
    destination: str | None = None
    departure_date: str | None = None
    travellers: int = 2


class PricingSnapshot(BaseModel):
    subtotal: int
    taxes: int
    discounts: int
    addons: int
    total: int
    per_traveller: int
    currency: str = "INR"
    calculated_at: datetime


class BookingCreate(BaseModel):
    trip_id: str
    idempotency_key: str | None = None


class BookingOut(BaseModel):
    id: UUID
    status: str
    total_amount: int
    currency: str = "INR"
    provider_reference: str | None = None


class PaymentCreate(BaseModel):
    booking_id: str
    method: str  # upi|card|netbanking|wallet|emi
    idempotency_key: str | None = None


class PaymentOut(BaseModel):
    id: UUID
    status: str
    amount: int
    provider: str
    payment_reference: str | None = None


class WishlistAdd(BaseModel):
    item_type: str
    item_id: str


class AIAction(BaseModel):
    type: str  # ADD_DESTINATION|ADD_HOTEL|ADD_FLIGHT|ADD_CAB|ADD_ACTIVITY|CHANGE_DATE|CHANGE_BUDGET|REMOVE_ITEM|OPTIMIZE_TRIP
    payload: dict = Field(default_factory=dict)


class AIChatIn(BaseModel):
    message: str
    trip_id: str | None = None
    history: list[dict] = Field(default_factory=list)


class AIChatOut(BaseModel):
    message: str
    trip_plan: dict | None = None
    actions: list[AIAction] = Field(default_factory=list)
    is_demo: bool = True


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str
