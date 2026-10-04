"""Flight provider contract. Vendor code lives in adapters, never in services."""

from typing import Protocol

from app.schemas.schemas import FlightOffer


class FlightProvider(Protocol):
    name: str

    async def search(self, origin: str, destination: str, date: str | None, travellers: int = 2) -> list[FlightOffer]: ...
    async def get_details(self, offer_id: str) -> FlightOffer | None: ...
