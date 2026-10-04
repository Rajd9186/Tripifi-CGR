"""Structured UI actions. Every button in AI responses maps to one of these."""

from enum import Enum

from pydantic import BaseModel, Field


class ActionType(str, Enum):
    CREATE_TRIP = "CREATE_TRIP"
    UPDATE_TRIP = "UPDATE_TRIP"
    ADD_TRANSPORT = "ADD_TRANSPORT"
    ADD_HOTEL = "ADD_HOTEL"
    ADD_CAB = "ADD_CAB"
    ADD_ACTIVITY = "ADD_ACTIVITY"
    REMOVE_ITEM = "REMOVE_ITEM"
    MOVE_ITEM = "MOVE_ITEM"
    UPDATE_BUDGET = "UPDATE_BUDGET"
    SAVE_WISHLIST = "SAVE_WISHLIST"
    OPEN_SEARCH = "OPEN_SEARCH"
    OPEN_TRIP = "OPEN_TRIP"
    REQUEST_BOOKING = "REQUEST_BOOKING"
    # Legacy aliases kept for backward compatibility with existing clients:
    ADD_DESTINATION = "ADD_DESTINATION"
    ADD_FLIGHT = "ADD_FLIGHT"
    CHANGE_DATE = "CHANGE_DATE"
    CHANGE_BUDGET = "CHANGE_BUDGET"
    OPTIMIZE_TRIP = "OPTIMIZE_TRIP"


class ActionSafety(str, Enum):
    READ_ONLY = "READ_ONLY"
    SAFE_WRITE = "SAFE_WRITE"
    CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED"


SAFETY: dict[str, ActionSafety] = {
    "CREATE_TRIP": ActionSafety.SAFE_WRITE,
    "UPDATE_TRIP": ActionSafety.SAFE_WRITE,
    "ADD_TRANSPORT": ActionSafety.SAFE_WRITE,
    "ADD_HOTEL": ActionSafety.SAFE_WRITE,
    "ADD_CAB": ActionSafety.SAFE_WRITE,
    "ADD_ACTIVITY": ActionSafety.SAFE_WRITE,
    "REMOVE_ITEM": ActionSafety.CONFIRMATION_REQUIRED,
    "MOVE_ITEM": ActionSafety.SAFE_WRITE,
    "UPDATE_BUDGET": ActionSafety.SAFE_WRITE,
    "SAVE_WISHLIST": ActionSafety.SAFE_WRITE,
    "OPEN_SEARCH": ActionSafety.READ_ONLY,
    "OPEN_TRIP": ActionSafety.READ_ONLY,
    "REQUEST_BOOKING": ActionSafety.SAFE_WRITE,
    "ADD_DESTINATION": ActionSafety.SAFE_WRITE,
    "ADD_FLIGHT": ActionSafety.SAFE_WRITE,
    "CHANGE_DATE": ActionSafety.SAFE_WRITE,
    "CHANGE_BUDGET": ActionSafety.SAFE_WRITE,
    "OPTIMIZE_TRIP": ActionSafety.READ_ONLY,
}


class UIAction(BaseModel):
    type: str
    requires_confirmation: bool = False
    payload: dict = Field(default_factory=dict)

    def model_post_init(self, _ctx) -> None:
        safety = SAFETY.get(self.type, ActionSafety.CONFIRMATION_REQUIRED)
        if safety == ActionSafety.CONFIRMATION_REQUIRED:
            object.__setattr__(self, "requires_confirmation", True)
