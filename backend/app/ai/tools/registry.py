"""Tool registry. Explicitly registered, typed, validated tools only.

The LLM never gets SQL, filesystem, shell, or arbitrary HTTP access —
only these functions, each with a safety classification.
"""

from typing import Any

from app.data.destinations import DESTINATIONS as CATALOG
from app.services.search import activity_service, cab_service, destination_service, flight_service, hotel_service, train_service

DESTINATIONS = {
    slug: {"name": d["name"], "days": f"{d['days_min']}–{d['days_max']}",
           "budget": f"₹{d['budget_min']:,}–₹{d['budget_max']:,}",
           "best_for": " · ".join(d["themes"][:3]).title()}
    for slug, d in ((d["slug"], d) for d in CATALOG)
}

ACTIVITIES = {
    "sikkim": [
        {"id": "ACT-SKG-001", "title": "Tsomgo Lake excursion", "duration": "Full day", "price": 1800},
        {"id": "ACT-SKG-002", "title": "MG Marg evening walk", "duration": "2–3 hours", "price": 0},
        {"id": "ACT-SKG-003", "title": "Pelling Skywalk", "duration": "Half day", "price": 1200},
    ],
    "kashmir": [
        {"id": "ACT-KSH-001", "title": "Gulmarg Gondola", "duration": "4–5 hours", "price": 1800},
        {"id": "ACT-KSH-002", "title": "Dal Lake shikara ride", "duration": "2 hours", "price": 900},
    ],
    "kerala": [
        {"id": "ACT-KER-001", "title": "Alleppey houseboat day cruise", "duration": "Full day", "price": 8500},
        {"id": "ACT-KER-002", "title": "Kathakali performance", "duration": "2 hours", "price": 500},
    ],
}


async def search_destinations(query: str) -> dict:
    results = destination_service.search_destinations({"query": query, "limit": 6})
    return {"destinations": results, "source": "tripifi-catalog"}


async def get_destination_details(slug: str) -> dict:
    results = destination_service.search_destinations({"query": slug.replace("-", " "), "limit": 6})
    match = next((r for r in results if r["slug"] == slug.lower()), None)
    if match is None:
        return {"found": False, "source": "tripifi-catalog"}
    return {"found": True, **match, "source": "tripifi-catalog"}


async def _service_or_unavailable(coro, domain: str) -> dict:
    from app.services.search.base import SearchError

    try:
        payload = await coro
        return {"offers": payload["data"]["results"], "provider": payload["data"]["provider"], "source": "DEMO"}
    except SearchError as e:
        return {"offers": [], "source": "DEMO", "status": "UNAVAILABLE", "reason": e.code}


async def search_flights(origin: str, destination: str, date: str | None = None) -> dict:
    return await _service_or_unavailable(
        flight_service.search_flights({"origin": origin, "destination": destination, "departure_date": date}, "ai-tool"),
        "flights",
    )


async def search_trains(origin: str, destination: str, date: str | None = None) -> dict:
    return await _service_or_unavailable(
        train_service.search_trains({"origin": origin, "destination": destination, "departure_date": date}, "ai-tool"),
        "trains",
    )


async def search_hotels(destination: str) -> dict:
    return await _service_or_unavailable(
        hotel_service.search_hotels({"destination": destination}, "ai-tool"), "hotels",
    )


async def search_cabs(pickup: str, drop: str) -> dict:
    return await _service_or_unavailable(
        cab_service.search_cabs({"pickup": pickup, "drop": drop}, "ai-tool"), "cabs",
    )


async def search_activities(destination: str) -> dict:
    return await _service_or_unavailable(
        activity_service.search_activities({"destination": destination}, "ai-tool"), "activities",
    )


async def get_route(origin: str, destination: str) -> dict:
    from app.providers import registry

    provider = registry.get_routing_provider()
    if getattr(provider, "name", "") == "disabled":
        return {"route": None, "status": "UNAVAILABLE", "reason": "PROVIDER_UNAVAILABLE"}
    try:
        route = await provider.calculate_route(origin, destination)
        return {"route": route, "status": "DEMO", "estimated": True}
    except Exception as e:
        return {"route": None, "status": "UNAVAILABLE", "reason": str(e)}


async def get_activity_options(destination: str) -> dict:
    return {"activities": ACTIVITIES.get(destination.lower(), ACTIVITIES["sikkim"]), "source": "DEMO"}


async def get_destination_weather(destination: str) -> dict:
    """Live weather facts for a destination: Nominatim geocode → Open-Meteo.

    Returns measured/forecast values only — never best-time prose.
    On any provider failure returns {"available": False, ...} so the LLM
    says weather is unavailable instead of inventing it.
    """
    from app.providers.free import NominatimGeocodingProvider, ProviderError
    from app.providers.weather.open_meteo import ATTRIBUTION, OpenMeteoWeatherProvider

    try:
        geo = await NominatimGeocodingProvider().geocode(f"{destination}, India", limit=1)
        lat, lon = geo[0]["lat"], geo[0]["lon"]
    except ProviderError as e:
        return {"available": False, "reason": f"geocoding:{e.args[0] if e.args else 'failed'}"}
    except Exception:
        return {"available": False, "reason": "geocoding:failed"}
    try:
        forecast = await OpenMeteoWeatherProvider().forecast(lat, lon, days=3)
    except ProviderError as e:
        return {"available": False, "reason": f"weather:{e.args[0] if e.args else 'failed'}"}
    except Exception:
        return {"available": False, "reason": "weather:failed"}
    data = forecast.get("data", {})
    return {
        "available": True,
        "destination": destination,
        "current_temp_c": data.get("current_temp_c"),
        "current_condition": data.get("current_condition"),
        "daily": data.get("daily", []),
        "source": "open_meteo",
        "attribution": ATTRIBUTION,
    }


def _items_total(items: list[dict]) -> int:
    return sum(int(i.get("amount", 0) or 0) for i in items)


async def create_trip(trip_state: dict, patch: dict) -> dict:
    for key in ("origin", "destinations", "dates", "duration_days", "travellers", "traveller_type", "budget"):
        if patch.get(key) is not None:
            trip_state[key] = patch[key]
    return {"trip_state": trip_state}


async def get_trip(trip_state: dict) -> dict:
    return {"trip_state": dict(trip_state)}


async def update_trip(trip_state: dict, patch: dict) -> dict:
    allowed = {"origin", "destinations", "dates", "duration_days", "travellers", "traveller_type", "budget", "preferences"}
    for key, value in patch.items():
        if key in allowed and value is not None:
            trip_state[key] = value
    return {"trip_state": trip_state}


async def add_trip_item(trip_state: dict, collection: str, item: dict) -> dict:
    if collection not in ("transport", "hotels", "activities"):
        raise ValueError(f"Unknown collection: {collection}")
    trip_state.setdefault(collection, []).append(item)
    trip_state.setdefault("selected_items", []).append({**item, "collection": collection})
    return {"trip_state": trip_state, "added": item}


async def remove_trip_item(trip_state: dict, item_id: str) -> dict:
    removed = None
    for collection in ("transport", "hotels", "activities"):
        items = trip_state.get(collection, [])
        for item in list(items):
            if item.get("id") == item_id:
                items.remove(item)
                removed = item
    trip_state["selected_items"] = [i for i in trip_state.get("selected_items", []) if i.get("id") != item_id]
    if removed is None:
        raise ValueError(f"Item not found: {item_id}")
    return {"trip_state": trip_state, "removed": removed}


async def move_trip_item(trip_state: dict, item_id: str, to_day: int) -> dict:
    itinerary = trip_state.setdefault("itinerary", [])
    for entry in itinerary:
        if entry.get("id") == item_id:
            entry["day"] = to_day
            return {"trip_state": trip_state, "moved": entry}
    itinerary.append({"id": item_id, "day": to_day})
    return {"trip_state": trip_state, "moved": {"id": item_id, "day": to_day}}


async def create_itinerary(trip_state: dict, days: list[dict]) -> dict:
    # Deterministic ordering validation: days ascending, no duplicates.
    seen: set[int] = set()
    for entry in days:
        day = int(entry.get("day", 0))
        if day < 1 or day in seen:
            raise ValueError(f"Invalid itinerary day: {entry}")
        seen.add(day)
    trip_state["itinerary"] = sorted(days, key=lambda e: int(e["day"]))
    return {"trip_state": trip_state}


async def calculate_trip_budget(trip_state: dict) -> dict:
    transport = _items_total(trip_state.get("transport", []))
    hotels = _items_total(trip_state.get("hotels", []))
    cabs = _items_total([i for i in trip_state.get("transport", []) if i.get("kind") == "cab"])
    activities = _items_total(trip_state.get("activities", []))
    subtotal = transport + hotels + activities
    taxes = round(subtotal * 0.05)
    total = subtotal + taxes
    travellers = max(1, int(trip_state.get("travellers", 2) or 2))
    return {
        "transport": transport,
        "hotels": hotels,
        "cabs": cabs,
        "activities": activities,
        "taxes": taxes,
        "total": total,
        "per_traveller": (total + travellers - 1) // travellers,
        "currency": "INR",
        "estimated": True,
    }


async def optimize_trip_budget(trip_state: dict, target: int) -> dict:
    budget = await calculate_trip_budget(trip_state)
    options: list[dict] = []
    hotels = sorted(trip_state.get("hotels", []), key=lambda h: int(h.get("amount", 0) or 0), reverse=True)
    if hotels and hotels[0].get("amount"):
        saving = round(int(hotels[0]["amount"]) * 0.25)
        options.append({"action": "CHANGE_HOTEL_TIER", "title": "Switch to a comfortable hotel tier", "saving": saving})
    cabs = [t for t in trip_state.get("transport", []) if t.get("kind") == "cab" and int(t.get("amount", 0) or 0) > 4000]
    if cabs:
        options.append({"action": "CHANGE_CAB", "title": "Downgrade cab category for transfers", "saving": 1500})
    acts = sorted(trip_state.get("activities", []), key=lambda a: int(a.get("amount", 0) or 0), reverse=True)
    if acts and acts[0].get("amount"):
        options.append({"action": "REMOVE_ACTIVITY", "title": f"Make '{acts[0].get('title')}' optional", "saving": int(acts[0]["amount"])})
    return {"current_total": budget["total"], "target": target, "options": options[:3], "estimated": True}


async def add_to_wishlist(item: dict) -> dict:
    if not item.get("id"):
        raise ValueError("Wishlist item needs an id")
    return {"saved": item}


async def remove_from_wishlist(item_id: str) -> dict:
    if not item_id:
        raise ValueError("Wishlist item id required")
    return {"removed": item_id}


TOOL_REGISTRY: dict[str, dict] = {
    "search_destinations": {"fn": search_destinations, "safety": "READ_ONLY", "description": "Search Tripifi destinations"},
    "get_destination_details": {"fn": get_destination_details, "safety": "READ_ONLY", "description": "Destination facts"},
    "search_flights": {"fn": search_flights, "safety": "READ_ONLY", "description": "Demo flight schedules (not bookable)"},
    "search_trains": {"fn": search_trains, "safety": "READ_ONLY", "description": "Demo train schedules (not bookable)"},
    "search_hotels": {"fn": search_hotels, "safety": "READ_ONLY", "description": "Demo hotel inventory (not bookable)"},
    "search_cabs": {"fn": search_cabs, "safety": "READ_ONLY", "description": "Demo cab inventory with estimated fares"},
    "search_activities": {"fn": search_activities, "safety": "READ_ONLY", "description": "Activity options for a destination"},
    "get_route": {"fn": get_route, "safety": "READ_ONLY", "description": "Estimated route distance/duration"},
    "get_activity_options": {"fn": get_activity_options, "safety": "READ_ONLY", "description": "Activity options for a destination"},
    "get_destination_weather": {"fn": get_destination_weather, "safety": "READ_ONLY", "description": "Live weather via Open-Meteo (measured values only)"},
    "create_trip": {"fn": create_trip, "safety": "SAFE_WRITE", "description": "Initialize the working trip state"},
    "get_trip": {"fn": get_trip, "safety": "READ_ONLY", "description": "Read the working trip state"},
    "update_trip": {"fn": update_trip, "safety": "SAFE_WRITE", "description": "Update trip fields"},
    "add_trip_item": {"fn": add_trip_item, "safety": "SAFE_WRITE", "description": "Add transport/hotel/activity"},
    "remove_trip_item": {"fn": remove_trip_item, "safety": "CONFIRMATION_REQUIRED", "description": "Remove a trip item"},
    "move_trip_item": {"fn": move_trip_item, "safety": "SAFE_WRITE", "description": "Move an itinerary entry to another day"},
    "create_itinerary": {"fn": create_itinerary, "safety": "SAFE_WRITE", "description": "Write a validated day-by-day itinerary"},
    "calculate_trip_budget": {"fn": calculate_trip_budget, "safety": "READ_ONLY", "description": "Deterministic budget math"},
    "optimize_trip_budget": {"fn": optimize_trip_budget, "safety": "READ_ONLY", "description": "Deterministic savings options"},
    "add_to_wishlist": {"fn": add_to_wishlist, "safety": "SAFE_WRITE", "description": "Save an item to the wishlist"},
    "remove_from_wishlist": {"fn": remove_from_wishlist, "safety": "SAFE_WRITE", "description": "Remove a wishlist item"},
}


async def call_tool(name: str, **kwargs: Any) -> Any:
    entry = TOOL_REGISTRY.get(name)
    if entry is None:
        raise ValueError(f"Unknown tool: {name}")
    return await entry["fn"](**kwargs)
