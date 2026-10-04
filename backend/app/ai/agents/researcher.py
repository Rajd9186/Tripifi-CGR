"""Research agent: Tripifi data only. Never invents inventory."""

from app.ai.tools.registry import call_tool


async def research_destination(slug: str | None) -> dict:
    if not slug:
        return {"destination": None, "source": "DEMO"}
    details = await call_tool("get_destination_details", slug=slug)
    activities = await call_tool("get_activity_options", destination=slug)
    return {"destination": details, "activities": activities.get("activities", []), "source": "DEMO"}
