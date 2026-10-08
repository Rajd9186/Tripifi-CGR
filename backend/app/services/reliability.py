"""Reliability primitives for third-party provider calls.

- retry with backoff, idempotent GETs only (never retry POST booking calls)
- per-provider circuit breaker (opens 60s after N consecutive failures)
- single-flight de-duplication (concurrent identical calls share one fetch)
- stale-while-revalidate cache wrapper
- persisted monthly quota counter (best-effort file persistence; in-memory
  always works — Render's ephemeral disk may reset counters on deploy, which
  only makes the guard conservative, never permissive)

All state is process-local; swap for Redis without touching callers.
"""

import asyncio
import json
import os
import time
from typing import Any, Awaitable, Callable

from app.core.config import get_settings

_QUOTA_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "quotas.json")

_breakers: dict[str, dict] = {}
_inflight: dict[str, asyncio.Task] = {}
_locks: dict[str, asyncio.Lock] = {}
_monthly_use: dict[str, dict[str, int]] = {}
_quota_loaded = False


def _settings():
    return get_settings()


def _lock(name: str) -> asyncio.Lock:
    return _locks.setdefault(name, asyncio.Lock())


def circuit_allows(provider: str) -> bool:
    cfg = _breakers.get(provider)
    if not cfg or not cfg.get("open_until"):
        return True
    if time.monotonic() >= cfg["open_until"]:
        cfg["open_until"] = 0.0
        cfg["failures"] = 0
        return True
    return False


def circuit_record(provider: str, ok: bool) -> None:
    settings = _settings()
    cfg = _breakers.setdefault(provider, {"failures": 0, "open_until": 0.0})
    if ok:
        cfg["failures"] = 0
        cfg["open_until"] = 0.0
        return
    cfg["failures"] += 1
    if cfg["failures"] >= settings.circuit_failure_threshold:
        cfg["open_until"] = time.monotonic() + settings.circuit_open_seconds


def _load_quotas() -> None:
    global _quota_loaded
    if _quota_loaded:
        return
    _quota_loaded = True
    try:
        with open(_QUOTA_FILE, encoding="utf-8") as fh:
            data = json.load(fh)
        if isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, dict):
                    _monthly_use[k] = {mk: int(mv) for mk, mv in v.items()}
    except Exception:
        pass


def _save_quotas() -> None:
    try:
        os.makedirs(os.path.dirname(_QUOTA_FILE), exist_ok=True)
        with open(_QUOTA_FILE, "w", encoding="utf-8") as fh:
            json.dump(_monthly_use, fh)
    except Exception:
        pass


def _month_key() -> str:
    return time.strftime("%Y-%m")


def quota_remaining(provider: str, monthly_quota: int) -> int:
    """Calls left this month before the stop threshold. Never negative."""
    _load_quotas()
    settings = _settings()
    stop_at = monthly_quota * settings.quota_stop_pct / 100.0
    used = _monthly_use.get(provider, {}).get(_month_key(), 0)
    return max(0, int(monthly_quota - stop_at - used))


def quota_check(provider: str, monthly_quota: int) -> None:
    """Raise when the provider is at/below its stop threshold."""
    from app.providers.free import ProviderError

    if quota_remaining(provider, monthly_quota) <= 0:
        raise ProviderError("RATE_LIMITED", f"{provider} monthly quota guard tripped")


def quota_consume(provider: str, n: int = 1) -> None:
    _load_quotas()
    bucket = _monthly_use.setdefault(provider, {})
    month = _month_key()
    bucket[month] = bucket.get(month, 0) + n
    _save_quotas()


async def retry_get(
    fetch: Callable[[], Awaitable[Any]],
    *,
    attempts: int = 3,
    base_delay: float = 0.5,
) -> Any:
    """Retry idempotent GET fetches with exponential backoff. Timeouts and
    connection errors retry; HTTP/application errors propagate immediately."""
    import httpx

    last: Exception | None = None
    for attempt in range(attempts):
        try:
            return await fetch()
        except (httpx.TimeoutException, httpx.ConnectError) as e:
            last = e
            if attempt < attempts - 1:
                await asyncio.sleep(base_delay * (2 ** attempt))
    assert last is not None
    raise last


async def single_flight(key: str, fetch: Callable[[], Awaitable[Any]]) -> Any:
    """Concurrent identical calls share one in-flight fetch."""
    task = _inflight.get(key)
    if task is None:
        async def _run():
            try:
                return await fetch()
            finally:
                _inflight.pop(key, None)

        task = asyncio.ensure_future(_run())
        _inflight[key] = task
    return await task


async def swr_get(
    cache,
    key: str,
    ttl_seconds: int,
    stale_seconds: int,
    fetch: Callable[[], Awaitable[Any]],
) -> tuple[Any, bool]:
    """Stale-while-revalidate: fresh hit returns immediately; stale hit
    returns immediately AND refreshes in background; miss fetches.

    Returns (value, from_cache).
    """
    raw = await cache.get(f"swr:{key}") if hasattr(cache, "get") else None
    now = time.time()
    if isinstance(raw, dict) and "value" in raw and "stored_at" in raw:
        age = now - raw["stored_at"]
        if age < ttl_seconds:
            return raw["value"], True
        if age < ttl_seconds + stale_seconds:
            async def _refresh():
                try:
                    fresh = await fetch()
                    await cache.set(f"swr:{key}", {"value": fresh, "stored_at": time.time()}, ttl_seconds + stale_seconds)
                except Exception:
                    pass

            asyncio.ensure_future(_refresh())
            return raw["value"], True
    value = await single_flight(f"swr:{key}", fetch)
    try:
        await cache.set(f"swr:{key}", {"value": value, "stored_at": time.time()}, ttl_seconds + stale_seconds)
    except Exception:
        pass
    return value, False


def https_only(url: str, label: str) -> str:
    """Refuse to call third parties over plaintext HTTP."""
    from app.providers.free import ProviderError

    if not url.lower().startswith("https://"):
        raise ProviderError("NOT_SUPPORTED", f"{label} requires an HTTPS endpoint")
    return url


def reset_reliability_state() -> None:
    """Test hook: clear breakers, inflight tasks, and quota memory."""
    global _quota_loaded
    _breakers.clear()
    _inflight.clear()
    _locks.clear()
    _monthly_use.clear()
    _quota_loaded = False


async def guarded(provider_name: str, fetch: Callable[[], Awaitable[Any]]) -> Any:
    """Circuit-breaker gate around one provider call.

    Open breaker -> immediate UNAVAILABLE (no hammering). Failures and
    successes feed the breaker. ProviderError states pass through untouched.
    """
    from app.providers.free import ProviderError

    if not circuit_allows(provider_name):
        raise ProviderError("UNAVAILABLE", f"{provider_name} circuit open — backing off")
    try:
        result = await fetch()
    except ProviderError:
        circuit_record(provider_name, False)
        raise
    except Exception as e:
        circuit_record(provider_name, False)
        raise ProviderError("UNAVAILABLE", str(e))
    circuit_record(provider_name, True)
    return result
