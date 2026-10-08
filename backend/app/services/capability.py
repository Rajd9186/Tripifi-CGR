"""Central booking-capability decision layer.

Rule: live booking flow ONLY when a legitimate provider supports the
operation, is configured, and is available. Everything else becomes an
assisted booking enquiry — never a dead end, never fabricated inventory.

Two APIs (both kept stable):
- booking_capability(service, provider_ok): legacy booking-only decision.
- service_matrix(): per-service {live_data, estimate, schedule_only,
  bookable, assisted} + user-facing mode in
  LIVE | ESTIMATE | SCHEDULE_ONLY | DISCOVERY | ASSISTED.
"""

from app.core.config import get_settings
from app.providers import registry

# Which services Tripifi can actually complete end-to-end today.
BOOKING_SUPPORTED: dict[str, bool] = {
    "flight": False,  # schedules only via dev providers; no ticketing
    "train": False,  # no legitimate booking API connected
    "hotel": False,  # no authorized inventory connected
    "cab": False,  # estimated fares only; human confirmation required
    "package": True,  # Tripifi's own package database with internal pricing
}


def provider_state(service: str) -> str:
    """SUCCESS | NOT_SUPPORTED | NOT_CONFIGURED — no fake 'live' claims.

    Real adapter states come from the registry health check so the two
    can never disagree.
    """
    from app.providers import registry as reg

    table = {h["provider"]: h["state"] for h in reg.get_provider_health()}
    key = service + "s" if service + "s" in table else service
    if key not in table:
        return "NOT_SUPPORTED"
    state = table[key]
    if state == "SUCCESS":
        return "SUCCESS"
    if state == "NOT_CONFIGURED":
        return "NOT_CONFIGURED"
    return "NOT_SUPPORTED"


def booking_capability(service: str, provider_ok: bool) -> dict:
    """Reusable across flights/trains/hotels/cabs/packages/custom trips."""
    bookable = bool(BOOKING_SUPPORTED.get(service, False) and provider_ok)
    if bookable:
        return {"mode": "LIVE_RESULTS", "bookable": True, "enquiry": False}
    return {"mode": "ASSISTED_BOOKING", "bookable": False, "enquiry": True}


def service_mode(service: str) -> dict:
    """Per-service capability matrix computed from registry config + health.

    Returns {mode, live_data, estimate, schedule_only, bookable, assisted,
    source, reason}. mode in LIVE|ESTIMATE|SCHEDULE_ONLY|DISCOVERY|ASSISTED.
    Demo and disabled adapters always resolve to ASSISTED (demo payloads stay
    flagged is_demo; nothing bookable is claimed).
    """
    from app.providers import registry as reg

    settings = get_settings()
    setting_name = {
        "flight": "flight_provider", "train": "train_provider",
        "hotel": "hotel_provider", "cab": "cab_provider",
        "activity": "activity_provider", "routing": "routing_provider",
        "geocoding": "geocoding_provider", "weather": "weather_provider",
        "packages": "map_provider",
    }.get(service, "")
    raw = getattr(settings, setting_name, "demo") if setting_name else "demo"
    chain = reg.parse_chain(raw) or ["demo"]
    first = chain[0]

    base = {
        "service": service, "mode": "ASSISTED", "live_data": False,
        "estimate": False, "schedule_only": False,
        "bookable": False, "assisted": True, "source": first, "reason": "",
    }
    if first in ("disabled", "demo"):
        if service == "packages" and first == "demo":
            # Tripifi's own catalog: real internal inventory.
            base.update(mode="LIVE", live_data=True, bookable=True,
                         assisted=False, reason="Tripifi catalog")
            return base
        if first == "demo" and service == "cab":
            # Demo cab rows are pricing-engine estimates, clearly labelled.
            base.update(mode="ESTIMATE", estimate=True,
                         reason="demo estimates; human confirmation required")
            return base
        if first == "demo" and service == "train":
            # Demo schedules read as a timetable, never live availability.
            base.update(mode="SCHEDULE_ONLY", schedule_only=True,
                         reason="demo timetable; availability not live")
            return base
        base["reason"] = "demo data" if first == "demo" else "provider disabled"
        return base

    health = {h["provider"]: h for h in reg.get_provider_health()}
    key = {"flights": "flights", "flight": "flights"}.get(service, service + "s"
            if service + "s" in health else service)
    state = (health.get(key) or {}).get("state", "ERROR")
    if state in ("NOT_CONFIGURED", "UNAVAILABLE", "ERROR"):
        base["reason"] = f"adapter '{first}' {state.lower()}"
        return base

    if service == "flight" and first == "aviationstack":
        base.update(mode="SCHEDULE_ONLY", live_data=True, schedule_only=True,
                     reason="live schedules, no fares or availability")
    elif service == "hotel" and first == "overpass":
        base.update(mode="DISCOVERY", live_data=True,
                     reason="live discovery: names, location, amenities; no prices")
    elif service == "activity" and first == "overpass":
        base.update(mode="DISCOVERY", live_data=True,
                     reason="live discovery: places and info; booking assisted")
    elif service == "cab":
        base.update(mode="ESTIMATE", estimate=True,
                     reason="routing distance x rate card; human confirmation required")
    elif service == "routing" and first == "osrm":
        base.update(mode="LIVE", live_data=True, reason="measured route")
    elif service == "routing" and first == "estimate":
        base.update(mode="ESTIMATE", estimate=True, reason="haversine x1.3 fallback")
    elif service == "geocoding" and first == "nominatim":
        base.update(mode="LIVE", live_data=True, reason="OpenStreetMap geocoding")
    elif service == "weather" and first == "open_meteo":
        base.update(mode="LIVE", live_data=True, reason="Open-Meteo forecast")
    elif service == "packages":
        base.update(mode="LIVE", live_data=True, bookable=True,
                     assisted=False, reason="Tripifi catalog")
    else:
        base["reason"] = f"adapter '{first}' has no live-data mapping"
    return base


def service_matrix() -> dict[str, dict]:
    return {s: service_mode(s) for s in
            ["flight", "train", "hotel", "cab", "activity", "routing",
             "geocoding", "weather", "packages"]}


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
