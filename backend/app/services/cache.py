"""Cache abstraction. Memory impl today; Redis can replace it without touching callers."""

import time
from typing import Any


class CacheService:
    async def get(self, key: str) -> Any | None: ...
    async def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None: ...
    async def delete(self, key: str) -> None: ...


class MemoryCache(CacheService):
    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float]] = {}

    async def get(self, key: str) -> Any | None:
        hit = self._store.get(key)
        if not hit:
            return None
        value, expires = hit
        if expires < time.time():
            self._store.pop(key, None)
            return None
        return value

    async def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        self._store[key] = (value, time.time() + ttl_seconds)

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)


_cache = MemoryCache()


def get_cache() -> CacheService:
    return _cache
