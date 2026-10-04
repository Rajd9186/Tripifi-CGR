"""Search service base: envelope, error codes, cache keys, observability.

Response envelope (all search endpoints):
    {"success": True, "data": {"results": [...], "provider": {...}}, "error": None, "requestId": "..."}
Errors never leak stack traces; user messages stay friendly.
"""

import hashlib
import json
import time
from typing import Any

ERROR_MESSAGES = {
    "INVALID_SEARCH": "Please check your search details and try again.",
    "PROVIDER_UNAVAILABLE": "We couldn't retrieve availability right now.",
    "PROVIDER_TIMEOUT": "The search took too long. Please try again.",
    "NO_RESULTS": "No results found for this search.",
    "RATE_LIMITED": "Too many requests. Please wait a moment.",
    "INVALID_PROVIDER_RESPONSE": "We couldn't retrieve availability right now.",
    "SEARCH_FAILED": "We couldn't retrieve availability right now.",
}


class SearchError(Exception):
    def __init__(self, code: str, detail: str = ""):
        super().__init__(detail or code)
        self.code = code
        self.detail = detail


def cache_key(domain: str, params: dict[str, Any], ttl_note: str = "") -> str:
    raw = json.dumps(params, sort_keys=True, default=str)
    digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"search:v1:{domain}:{digest}:{ttl_note}"


def envelope(results: list[dict], provider: dict, request_id: str) -> dict:
    return {
        "success": True,
        "data": {"results": results, "provider": provider},
        "error": None,
        "requestId": request_id,
    }


def error_envelope(code: str, request_id: str, detail: str = "") -> dict:
    return {
        "success": False,
        "data": None,
        "error": {"code": code, "message": ERROR_MESSAGES.get(code, ERROR_MESSAGES["SEARCH_FAILED"])},
        "requestId": request_id,
    }


def observe(domain: str, provider_name: str, latency_ms: int, count: int, status: str, request_id: str) -> None:
    # Structured, secret-free observability line.
    print(f"[search] request_id={request_id} domain={domain} provider={provider_name} "
          f"latency_ms={latency_ms} results={count} status={status}")


def cached_count(cached: dict) -> int:
    """Count results inside a cached envelope without trusting its shape."""
    data = cached.get("data") if isinstance(cached, dict) else None
    results = (data or {}).get("results") if isinstance(data, dict) else None
    return len(results) if isinstance(results, list) else 0


def now_ms() -> int:
    return int(time.monotonic() * 1000)
