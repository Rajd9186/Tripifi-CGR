"""Structured travel intent. The LLM never writes free-form dicts into app state."""

from enum import Enum

from pydantic import BaseModel, Field


class IntentType(str, Enum):
    PLAN_TRIP = "PLAN_TRIP"
    SEARCH_DESTINATION = "SEARCH_DESTINATION"
    SEARCH_FLIGHT = "SEARCH_FLIGHT"
    SEARCH_TRAIN = "SEARCH_TRAIN"
    SEARCH_CAB = "SEARCH_CAB"
    SEARCH_HOTEL = "SEARCH_HOTEL"
    BUILD_ITINERARY = "BUILD_ITINERARY"
    CALCULATE_BUDGET = "CALCULATE_BUDGET"
    OPTIMIZE_BUDGET = "OPTIMIZE_BUDGET"
    MODIFY_TRIP = "MODIFY_TRIP"
    VIEW_TRIP = "VIEW_TRIP"
    SAVE_WISHLIST = "SAVE_WISHLIST"
    DESTINATION_QUESTION = "DESTINATION_QUESTION"
    BOOKING_ASSISTANCE = "BOOKING_ASSISTANCE"
    GENERAL_TRAVEL_QUESTION = "GENERAL_TRAVEL_QUESTION"


class TravelIntent(BaseModel):
    intent: IntentType
    origin: str | None = None
    destination: str | None = None
    destination_slug: str | None = None
    duration_days: int | None = Field(default=None, ge=1, le=60)
    travellers: int | None = Field(default=None, ge=1, le=50)
    traveller_type: str | None = None  # COUPLE|FAMILY|SOLO|GROUP
    budget: int | None = Field(default=None, ge=0)
    currency: str = "INR"
    missing: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
