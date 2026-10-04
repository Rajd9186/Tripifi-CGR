"""Package provider contract. Packages are Tripifi's own database."""

from typing import Protocol

from app.schemas.schemas import PackageOffer


class PackageProvider(Protocol):
    name: str

    async def list(self) -> list[PackageOffer]: ...
    async def get(self, slug: str) -> PackageOffer | None: ...
