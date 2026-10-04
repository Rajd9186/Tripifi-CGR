"""Tripifi's own package database. Internal pricing — estimated until confirmed."""

from app.schemas.schemas import PackageOffer

_PACKAGES = [
    {
        "slug": "sikkim-escape",
        "title": "Sikkim Escape",
        "destination": "Sikkim",
        "duration": "5 Nights / 6 Days",
        "route": "NJP → Gangtok → Pelling → NJP",
        "base_price": 69998,
        "tags": ["mountains", "honeymoon", "comfortable"],
        "inclusions": ["Hotel", "Breakfast", "Private Cab", "Sightseeing", "Transfers"],
    },
    {
        "slug": "kashmir-paradise",
        "title": "Kashmir Paradise",
        "destination": "Kashmir",
        "duration": "5 Nights / 6 Days",
        "route": "Srinagar → Gulmarg → Pahalgam",
        "base_price": 42999,
        "tags": ["lakes", "scenic", "luxury"],
        "inclusions": ["Houseboat/Hotel", "Breakfast", "Cab", "Sightseeing"],
    },
]


class DemoPackageProvider:
    name = "demo"

    async def list(self) -> list[PackageOffer]:
        return [
            PackageOffer(
                id=f"PKG-{p['slug'].upper()}", provider="demo", slug=p["slug"],
                title=p["title"], destination=p["destination"], duration=p["duration"],
                route=p["route"], base_price=p["base_price"], currency="INR",
                tags=p["tags"], inclusions=p["inclusions"], is_demo=True,
            )
            for p in _PACKAGES
        ]

    async def get(self, slug: str) -> PackageOffer | None:
        for p in await self.list():
            if p.slug == slug:
                return p
        return None
