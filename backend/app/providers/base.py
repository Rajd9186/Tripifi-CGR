"""Provider contracts. Routers/services depend on these, never on vendor SDKs."""

from typing import Protocol

from app.schemas.schemas import CabOffer, FlightOffer, HotelOffer, TrainOffer


class FlightProvider(Protocol):
    name: str

    async def search(self, origin: str, destination: str, date: str | None, travellers: int = 2) -> list[FlightOffer]: ...
    async def get_details(self, offer_id: str) -> FlightOffer | None: ...


class TrainProvider(Protocol):
    name: str

    async def search(self, origin: str, destination: str, date: str | None) -> list[TrainOffer]: ...


class HotelProvider(Protocol):
    name: str

    async def search(self, destination: str, checkin: str | None = None, checkout: str | None = None) -> list[HotelOffer]: ...


class CabProvider(Protocol):
    name: str

    async def search(self, pickup: str, drop: str) -> list[CabOffer]: ...


class PaymentProvider(Protocol):
    name: str

    async def create_payment(self, amount: int, currency: str = "INR", idempotency_key: str | None = None) -> dict: ...
    async def verify_payment(self, payment_reference: str) -> dict: ...
    async def refund_payment(self, payment_reference: str, amount: int | None = None) -> dict: ...


class MapsProvider(Protocol):
    name: str

    async def route(self, origin: str, destination: str) -> dict: ...


class GeocodingProvider(Protocol):
    name: str

    async def geocode(self, query: str, limit: int = 5) -> list[dict]: ...


class RoutingProvider(Protocol):
    name: str

    async def calculate_route(self, origin: str, destination: str) -> dict: ...
    async def calculate_distance(self, origin: str, destination: str) -> dict: ...


class AIProvider(Protocol):
    name: str

    async def chat(self, message: str, context: dict | None = None) -> dict: ...
    async def plan_trip(self, brief: dict) -> dict: ...
