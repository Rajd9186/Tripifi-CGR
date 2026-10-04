"""Routing provider contract. Independent from map rendering."""

from typing import Protocol


class RoutingProvider(Protocol):
    name: str

    async def calculate_route(self, origin: str, destination: str) -> dict: ...
    async def calculate_distance(self, origin: str, destination: str) -> dict: ...
