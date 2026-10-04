"""Hotel provider contract."""

from typing import Protocol

from app.schemas.schemas import HotelOffer


class HotelProvider(Protocol):
    name: str

    async def search(self, destination: str, checkin: str | None = None, checkout: str | None = None) -> list[HotelOffer]: ...
