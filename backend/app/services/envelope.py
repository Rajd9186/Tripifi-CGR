"""Standard result envelope for every provider call.

Every provider-facing service returns::

    {
        "state": SUCCESS | NO_RESULTS | UNAVAILABLE | RATE_LIMITED
                 | AUTH_ERROR | TIMEOUT | NOT_SUPPORTED,
        "data": ...payload...,
        "source": "nominatim" | "osrm" | ... (adapter name),
        "is_live": bool,        # real third-party data, not demo, not estimate
        "is_estimate": bool,    # computed/derived, not measured inventory
        "fetched_at": "2026-10-09T...+05:30",  # ISO-8601, always present
        "attribution": "...",   # licence/credit string, always present
        "cache_ttl": 86400,     # seconds this payload may be cached
        "mode": LIVE | ESTIMATE | SCHEDULE_ONLY | DISCOVERY | ASSISTED,
    }

Honesty is structural: prices the provider does not know are None (never 0),
demo payloads always carry is_demo, and live data is never mixed with demo
data in one list.
"""

from datetime import datetime, timezone

STATES = (
    "SUCCESS",
    "NO_RESULTS",
    "UNAVAILABLE",
    "RATE_LIMITED",
    "AUTH_ERROR",
    "TIMEOUT",
    "NOT_SUPPORTED",
)

MODES = ("LIVE", "ESTIMATE", "SCHEDULE_ONLY", "DISCOVERY", "ASSISTED")


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def result_envelope(
    *,
    state: str,
    data,
    source: str,
    is_live: bool = False,
    is_estimate: bool = False,
    attribution: str = "",
    cache_ttl: int = 300,
    mode: str = "ASSISTED",
    fetched_at: str | None = None,
) -> dict:
    if state not in STATES:
        raise ValueError(f"Unknown envelope state: {state!r} (expected one of {STATES})")
    if mode not in MODES:
        raise ValueError(f"Unknown envelope mode: {mode!r} (expected one of {MODES})")
    return {
        "state": state,
        "data": data,
        "source": source,
        "is_live": bool(is_live),
        "is_estimate": bool(is_estimate),
        "fetched_at": fetched_at or utcnow_iso(),
        "attribution": attribution,
        "cache_ttl": int(cache_ttl),
        "mode": mode,
    }


def error_to_state(exc: Exception) -> str:
    """Map a provider failure to an envelope state (never leaks internals)."""
    from app.providers.free import ProviderError

    if isinstance(exc, ProviderError):
        return exc.state if exc.state in STATES else "UNAVAILABLE"
    name = type(exc).__name__
    if name in ("TimeoutError",):
        return "TIMEOUT"
    return "UNAVAILABLE"


def failure_envelope(
    exc: Exception,
    *,
    source: str,
    attribution: str = "",
    mode: str = "ASSISTED",
) -> dict:
    state = error_to_state(exc)
    if state == "SUCCESS":
        state = "UNAVAILABLE"
    return result_envelope(
        state=state,
        data=None,
        source=source,
        is_live=False,
        is_estimate=False,
        attribution=attribution,
        cache_ttl=60,
        mode=mode,
    )
