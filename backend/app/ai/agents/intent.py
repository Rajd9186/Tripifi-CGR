"""Intent agent. Deterministic extraction first; LLM only refines ambiguity.

Never invents dates or budgets — missing critical fields become follow-up
questions, not hallucinations.
"""

import re

from app.ai.schemas.intent import IntentType, TravelIntent

DESTINATIONS = {
    # Canonical 12 (+ aliases below).
    "sikkim": ("Sikkim", "sikkim"),
    "kashmir": ("Kashmir", "kashmir"),
    "kerala": ("Kerala", "kerala"),
    "goa": ("Goa", "goa"),
    "rajasthan": ("Rajasthan", "rajasthan"),
    "ladakh": ("Ladakh", "ladakh"),
    "darjeeling": ("Darjeeling", "darjeeling"),
    "meghalaya": ("Meghalaya", "meghalaya"),
    "himachal-pradesh": ("Himachal Pradesh", "himachal-pradesh"),
    "himachal": ("Himachal Pradesh", "himachal-pradesh"),
    "uttarakhand": ("Uttarakhand", "uttarakhand"),
    "tamil-nadu": ("Tamil Nadu", "tamil-nadu"),
    "tamil nadu": ("Tamil Nadu", "tamil-nadu"),
    "northeast-india": ("Northeast India", "northeast-india"),
    "northeast": ("Northeast India", "northeast-india"),
    "andaman": ("Andaman", "andaman"),
    "west bengal": ("Darjeeling & West Bengal", "darjeeling"),
    "andaman nicobar": ("Andaman & Nicobar", "andaman"),
    # City/attraction aliases resolve to their region.
    "gangtok": ("Sikkim", "sikkim"),
    "srinagar": ("Kashmir", "kashmir"),
    "gulmarg": ("Kashmir", "kashmir"),
    "pahalgam": ("Kashmir", "kashmir"),
    "leh": ("Ladakh", "ladakh"),
    "pangong": ("Ladakh", "ladakh"),
    "nubra": ("Ladakh", "ladakh"),
    "shimla": ("Himachal Pradesh", "himachal-pradesh"),
    "manali": ("Himachal Pradesh", "himachal-pradesh"),
    "nainital": ("Uttarakhand", "uttarakhand"),
    "rishikesh": ("Uttarakhand", "uttarakhand"),
    "ooty": ("Tamil Nadu", "tamil-nadu"),
    "madurai": ("Tamil Nadu", "tamil-nadu"),
    "munnar": ("Kerala", "kerala"),
    "alleppey": ("Kerala", "kerala"),
    "kochi": ("Kerala", "kerala"),
    "jaipur": ("Rajasthan", "rajasthan"),
    "udaipur": ("Rajasthan", "rajasthan"),
    "jodhpur": ("Rajasthan", "rajasthan"),
    "jaisalmer": ("Rajasthan", "rajasthan"),
    "baga": ("Goa", "goa"),
    "palolem": ("Goa", "goa"),
    "shillong": ("Northeast India", "northeast-india"),
    "cherrapunji": ("Northeast India", "northeast-india"),
    "kaziranga": ("Northeast India", "northeast-india"),
    "havelock": ("Andaman", "andaman"),
}

# Frontend slugs that alias backend catalog slugs.
SLUG_ALIASES = {
    "west-bengal": "darjeeling",
    "andaman-nicobar": "andaman",
}


def resolve_slug(slug: str | None) -> str | None:
    if not slug:
        return None
    return SLUG_ALIASES.get(slug.lower(), slug.lower())

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}


def _destination(text: str) -> tuple[str, str] | None:
    lower = text.lower()
    for key in sorted(DESTINATIONS, key=len, reverse=True):
        if key in lower:
            return DESTINATIONS[key]
    return None


def _freeform_destination(text: str, origin: str | None) -> str | None:
    """A mentioned place outside the catalog (e.g. 'to Switzerland', 'in Coorg'):
    returned as a name with no slug so the gateway answers from LLM knowledge
    instead of a dead-end follow-up. Never echoes the origin city back."""
    for pattern in (
        r"\bto\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})",
        r"\bin\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})",
        r"\bvisit\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})",
    ):
        m = re.search(pattern, text)
        if m:
            name = m.group(1).strip()
            if name and (origin is None or name.lower() != origin.lower()):
                return name
    return None


def _origin(text: str) -> str | None:
    m = re.search(r"from\s+([A-Za-z][A-Za-z\s]+?)(?:\s+to\s|\s+for\s|\s+under\s|\s*,|\s*$)", text, re.I)
    return m.group(1).strip() if m else None


def _days(text: str) -> int | None:
    m = re.search(r"(\d+)\s*-?\s*days?", text, re.I) or re.search(r"(\d+)\s*-?\s*nights?", text, re.I)
    if m:
        return min(60, max(1, int(m.group(1))))
    for word, n in NUMBER_WORDS.items():
        if re.search(rf"\b{word}\b\s*-?\s*days?", text, re.I):
            return n
    if re.search(r"\bweekend\b", text, re.I):
        return 3
    return None


def _travellers(text: str) -> tuple[int | None, str | None]:
    m = re.search(r"(\d+)\s*(?:people|persons|travellers|travelers|adults)", text, re.I)
    if m:
        return min(50, max(1, int(m.group(1)))), "GROUP"
    if re.search(r"partner|couple|honeymoon|wife|husband", text, re.I):
        return 2, "COUPLE"
    if re.search(r"\bfamily\b", text, re.I):
        return 4, "FAMILY"
    if re.search(r"\bsolo\b|alone|myself", text, re.I):
        return 1, "SOLO"
    return None, None


def _budget(text: str) -> int | None:
    m = re.search(r"(?:under|around|below|budget)[^\d₹]*₹?\s*([\d,]+)", text, re.I) or re.search(r"₹\s*([\d,]+)", text)
    if not m:
        return None
    raw = int(m.group(1).replace(",", ""))
    return raw * 1000 if raw < 1000 else raw


def _keyword_intent(text: str) -> IntentType:
    lower = text.lower()
    if re.search(r"\bcheaper\b|\breduce\b.*\b(cost|budget|price)\b|\bcut\b.*\b(cost|budget|price)\b|\blower\b.*\b(cost|price|budget)\b|\bbring\b.*\bdown\b", lower):
        return IntentType.OPTIMIZE_BUDGET
    if re.search(r"\b(change|modify|update|switch|remove|replace)\b", lower):
        return IntentType.MODIFY_TRIP
    if re.search(r"\bflight\b", lower):
        return IntentType.SEARCH_FLIGHT
    if re.search(r"\btrain\b", lower):
        return IntentType.SEARCH_TRAIN
    if re.search(r"\b(hotel|stay|resort)\b", lower):
        return IntentType.SEARCH_HOTEL
    if re.search(r"\bcab\b|\btransfer\b|\btaxi\b", lower):
        return IntentType.SEARCH_CAB
    if re.search(r"\bitinerary\b|\bday by day\b|\bday-by-day\b", lower):
        return IntentType.BUILD_ITINERARY
    if re.search(r"\bbudget\b|\bcost\b", lower):
        return IntentType.CALCULATE_BUDGET
    if re.search(r"\bwishlist\b|\bsave\b", lower):
        return IntentType.SAVE_WISHLIST
    if re.search(r"\bbook\b", lower):
        return IntentType.BOOKING_ASSISTANCE
    # Question words win over generic plan verbs ("best time to visit X").
    if re.search(r"\b(where|best time|when|how to reach|places|things to do|safe|compare|versus|vs\.?)\b", lower):
        return IntentType.DESTINATION_QUESTION
    if re.search(r"\b(plan|trip|visit|holiday|vacation|honeymoon|go to|going to|\bgo\b|journey|need|want)\b", lower):
        return IntentType.PLAN_TRIP
    return IntentType.GENERAL_TRAVEL_QUESTION


def classify(message: str, trip_context: dict | None = None) -> TravelIntent:
    trip_context = trip_context or {}
    intent = _keyword_intent(message)
    dest = _destination(message)
    origin = _origin(message)
    freeform = _freeform_destination(message, origin) if dest is None else None
    days = _days(message)
    travellers, traveller_type = _travellers(message)
    budget = _budget(message)

    # Inherit trip context for follow-ups ("make it cheaper").
    if travellers is None and trip_context.get("travellers"):
        travellers = int(trip_context["travellers"])
    if not dest and trip_context.get("destinations"):
        first = (trip_context["destinations"] or [None])[0]
        if first:
            dest = (first, first)

    missing: list[str] = []
    assumptions: list[str] = []
    dest_name = dest[0] if dest else freeform
    dest_slug = dest[1] if dest else None
    if intent == IntentType.PLAN_TRIP:
        if not dest_name:
            missing.append("destination")
        if days is None:
            if trip_context.get("duration_days"):
                days = int(trip_context["duration_days"])
            else:
                missing.append("duration_days")
        if travellers is None:
            travellers = 2
            assumptions.append("I'll assume 2 travellers unless you'd like something different.")

    return TravelIntent(
        intent=intent,
        origin=origin or trip_context.get("origin"),
        destination=dest_name,
        destination_slug=dest_slug,
        duration_days=days,
        travellers=travellers,
        traveller_type=traveller_type,
        budget=budget if budget is not None else trip_context.get("budget"),
        missing=missing,
        assumptions=assumptions,
        confidence=0.85 if dest or intent != IntentType.PLAN_TRIP else (0.7 if freeform else 0.6),
    )
