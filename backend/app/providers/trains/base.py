"""Train provider contract."""

from typing import Protocol

from app.schemas.schemas import TrainOffer


class TrainProvider(Protocol):
    name: str

    async def search(self, origin: str, destination: str, date: str | None) -> list[TrainOffer]: ...
