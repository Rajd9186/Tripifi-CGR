"""Async SQLAlchemy engine/session. Business logic must not touch the engine directly."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        url = settings.database_url
        # Async drivers: postgresql+psycopg works with asyncpg-style via psycopg async.
        # For local sqlite fallback in tests, allow sqlite+aiosqlite.
        _engine = create_async_engine(url, pool_pre_ping=True, future=True)
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _session_factory


async def get_db() -> AsyncSession:  # FastAPI dependency
    factory = get_session_factory()
    async with factory() as session:
        yield session
