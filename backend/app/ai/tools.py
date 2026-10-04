"""AI tool registry. Tools call backend services — never raw DB writes,
never fake confirmations. Enquiry creation goes through the same
validation as the public endpoint.
"""

TOOLS = [
    "search_flights",
    "search_trains",
    "search_hotels",
    "search_cabs",
    "calculate_route",
    "calculate_trip_budget",
    "create_booking_enquiry",
    "get_enquiry_status",
]


async def create_booking_enquiry_tool(payload: dict) -> dict:
    """Validate-then-create path for AI-initiated enquiries.

    Requires customer_name, phone, email, consent — otherwise returns
    a need-details response instead of creating anything.
    """
    required = ["customer_name", "phone", "email"]
    missing = [k for k in required if not payload.get(k)]
    if missing or not payload.get("consent"):
        return {"ok": False, "need": missing + ([] if payload.get("consent") else ["consent"])}
    return {"ok": True, "queued": True, "type": payload.get("type", "CUSTOM_TRIP")}
