"""Activity provider contract."""

from typing import Protocol

from app.schemas.schemas import ActivityOffer


class ActivityProvider(Protocol):
    name: str

    async def search(self, destination: str) -> list[ActivityOffer]: ...
