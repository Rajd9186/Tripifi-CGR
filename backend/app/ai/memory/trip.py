"""Trip memory — the AI's working copy of the journey being planned.

Separate from conversation history. Seeded from the frontend Trip Builder
state; the gateway writes validated results back through tools.
"""

_trips: dict[str, dict] = {}


def get_trip_state(session_id: str) -> dict:
    return _trips.setdefault(
        session_id,
        {
            "trip_id": None,
            "origin": None,
            "destinations": [],
            "dates": {"start": None, "end": None},
            "duration_days": None,
            "travellers": 2,
            "traveller_type": None,
            "budget": None,
            "preferences": {},
            "transport": [],
            "hotels": [],
            "activities": [],
            "itinerary": [],
            "selected_items": [],
            "unresolved_questions": [],
        },
    )


def update_trip_state(session_id: str, patch: dict) -> dict:
    state = get_trip_state(session_id)
    for key, value in patch.items():
        if key in state and value is not None:
            state[key] = value
    return state


def clear_trip_state(session_id: str) -> None:
    _trips.pop(session_id, None)
