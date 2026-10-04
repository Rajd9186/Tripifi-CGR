"""Cab provider contract. Pricing always flows through CabPricingService."""

from typing import Protocol

from app.schemas.schemas import CabOffer


class CabProvider(Protocol):
    name: str

    async def search(self, pickup: str, drop: str) -> list[CabOffer]: ...
