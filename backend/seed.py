import asyncio

from sqlalchemy.ext.asyncio import create_async_engine

from app.models.models import Base

# Demo seed uses the same normalized shapes as demo providers.
AIRPORTS = [
    {"code": "CCU", "city": "Kolkata", "name": "Netaji Subhas Chandra Bose International"},
    {"code": "DEL", "city": "New Delhi", "name": "Indira Gandhi International"},
    {"code": "BOM", "city": "Mumbai", "name": "Chhatrapati Shivaji International"},
]

STATIONS = [
    {"code": "HWH", "name": "Howrah", "city": "Kolkata"},
    {"code": "NDLS", "name": "New Delhi", "city": "New Delhi"},
]


async def main(database_url: str) -> None:
    engine = create_async_engine(database_url, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"seeded schema at {database_url} (airports={len(AIRPORTS)}, stations={len(STATIONS)})")


if __name__ == "__main__":
    import os

    asyncio.run(main(os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./tripifi.db")))
