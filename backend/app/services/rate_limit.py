"""In-memory rate limiter. Swap for Redis without touching routers."""

import time

_hits: dict[str, list[float]] = {}


def check_rate_limit(key: str, max_hits: int, window_seconds: int) -> bool:
    """Return True if allowed, False if the caller should back off."""
    now = time.monotonic()
    window = _hits.setdefault(key, [])
    cutoff = now - window_seconds
    while window and window[0] < cutoff:
        window.pop(0)
    if len(window) >= max_hits:
        return False
    window.append(now)
    return True
