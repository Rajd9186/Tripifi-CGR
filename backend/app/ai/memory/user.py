"""User preference memory. Only explicit or reliably inferred preferences,
no sensitive profiling. Expandable later.
"""

_users: dict[str, dict] = {}

ALLOWED_KEYS = {
    "preferred_budget_range",
    "preferred_hotel_category",
    "preferred_transport",
    "travel_style",
    "preferred_destinations",
}


def get_user_memory(user_id: str) -> dict:
    return dict(_users.get(user_id, {}))


def save_user_memory(user_id: str, patch: dict) -> dict:
    mem = _users.setdefault(user_id, {})
    for key, value in patch.items():
        if key in ALLOWED_KEYS and value is not None:
            mem[key] = value
    return dict(mem)
