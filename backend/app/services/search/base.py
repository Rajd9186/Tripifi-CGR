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


def provider_error_to_search(exc: Exception) -> "SearchError":
    """Map provider failures to user-facing search errors (no leaks)."""
    from app.providers.free import ProviderError

    if isinstance(exc, SearchError):
        return exc
    if isinstance(exc, ProviderError):
        mapping = {
            "NO_RESULTS": "NO_RESULTS",
            "TIMEOUT": "PROVIDER_TIMEOUT",
            "RATE_LIMITED": "RATE_LIMITED",
        }
        code = mapping.get(exc.state, "PROVIDER_UNAVAILABLE")
        return SearchError(code, str(exc))
    return SearchError("PROVIDER_UNAVAILABLE", str(exc))


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


def envelope_with_mode(
    results: list[dict],
    provider,
    request_id: str,
    service: str,
) -> dict:
    """Envelope plus honesty metadata: mode/source/fetched_at.

    mode in LIVE|ESTIMATE|SCHEDULE_ONLY|DISCOVERY|ASSISTED (capability
    matrix); source is the serving adapter; fetched_at is ISO-8601 UTC.
    Demo payloads keep mode ASSISTED so the UI always offers the
    assisted-booking path next to flagged demo data.
    """
    from app.services import capability
    from app.services.envelope import utcnow_iso

    name = getattr(provider, "name", "") or "unknown"
    matrix = capability.service_mode(service, first_override=name if name != "unknown" else None)
    payload = envelope(
        results,
        {"name": name, "status": "DEMO" if name == "demo" else "LIVE"},
        request_id,
    )
    payload["data"]["mode"] = matrix["mode"]
    payload["data"]["source"] = name
    payload["data"]["fetched_at"] = utcnow_iso()
    return payload


async def run_chain(service: str, fetch):
    """Try each provider in the registry chain, in order.

    fetch(provider) -> offers. Falls through on UNAVAILABLE/TIMEOUT/
    RATE_LIMITED/AUTH_ERROR/NOT_SUPPORTED; NO_RESULTS stops the chain
    with an empty list. Returns (offers, serving_provider).
    """
    from app.providers import registry as reg
    from app.providers.free import ProviderError
    from app.services.reliability import guarded

    last_error: Exception | None = None
    tried = False
    for provider in reg.get_provider_chain(service):
        if getattr(provider, "name", "") == "disabled":
            continue
        tried = True
        try:
            offers = await guarded(f"{service}:{provider.name}", lambda p=provider: fetch(p))
            return offers, provider
        except ProviderError as e:
            if e.state == "NO_RESULTS":
                return [], provider
            last_error = e
        except SearchError:
            raise
        except Exception as e:
            last_error = e
    if last_error is not None:
        raise provider_error_to_search(last_error)
    if not tried:
        raise SearchError("PROVIDER_UNAVAILABLE", "Service is disabled.")
    raise SearchError("PROVIDER_UNAVAILABLE", "All providers failed.")


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
