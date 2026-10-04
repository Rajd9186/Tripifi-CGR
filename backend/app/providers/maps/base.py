"""Map provider contract. Rendering stays in the frontend MapLibre layer."""

from typing import Protocol


class MapProvider(Protocol):
    name: str

    async def route(self, origin: str, destination: str) -> dict: ...
