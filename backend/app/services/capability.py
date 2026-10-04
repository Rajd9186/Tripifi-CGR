"""Central booking-capability decision layer.

Rule: live booking flow ONLY when a legitimate provider supports the
operation, is configured, and is available. Everything else becomes an
assisted booking enquiry — never a dead end, never fabricated inventory.
"""

from app.core.config import get_settings

# Which services Tripifi can actually complete end-to-end today.
BOOKING_SUPPORTED: dict[str, bool] = {
    "flight": False,  # schedules only via dev providers; no ticketing
    "train": False,  # no legitimate booking API connected
    "hotel": False,  # no authorized inventory connected
    "cab": False,  # estimated fares only; human confirmation required
    "package": True,  # Tripifi's own package database with internal pricing
}


def provider_state(service: str) -> str:
    """SUCCESS | NOT_SUPPORTED | NOT_CONFIGURED — no fake 'live' claims."""
    settings = get_settings()
    configured = {
        "flight": settings.flight_provider != "demo" or bool(settings.aviation_api_key),
        "train": settings.train_provider != "demo",
        "hotel": settings.hotel_provider != "demo",
        "cab": True,  # internal pricing engine always available
        "routing": True,
        "geocoding": True,
    }
    if service not in configured:
        return "NOT_SUPPORTED"
    return "SUCCESS" if configured[service] else "NOT_CONFIGURED"


def booking_capability(service: str, provider_ok: bool) -> dict:
    """Reusable across flights/trains/hotels/cabs/packages/custom trips."""
    bookable = bool(BOOKING_SUPPORTED.get(service, False) and provider_ok)
    if bookable:
        return {"mode": "LIVE_RESULTS", "bookable": True, "enquiry": False}
    return {"mode": "ASSISTED_BOOKING", "bookable": False, "enquiry": True}


def provider_health() -> list[dict]:
    settings = get_settings()
    return [
        {"provider": "flight", "mode": settings.flight_provider, "state": provider_state("flight"), "bookable": BOOKING_SUPPORTED["flight"]},
        {"provider": "train", "mode": settings.train_provider, "state": provider_state("train"), "bookable": BOOKING_SUPPORTED["train"]},
        {"provider": "hotel", "mode": settings.hotel_provider, "state": provider_state("hotel"), "bookable": BOOKING_SUPPORTED["hotel"]},
        {"provider": "cab", "mode": settings.cab_provider, "state": provider_state("cab"), "bookable": BOOKING_SUPPORTED["cab"]},
        {"provider": "routing", "mode": settings.routing_provider, "state": provider_state("routing"), "bookable": False},
        {"provider": "geocoding", "mode": settings.geocoding_provider, "state": provider_state("geocoding"), "bookable": False},
    ]
