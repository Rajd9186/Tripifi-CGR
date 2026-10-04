"""Budget agent: code does the math, the LLM only explains it."""

from app.ai.tools.registry import call_tool


async def price_trip(trip_state: dict) -> dict:
    return await call_tool("calculate_trip_budget", trip_state=trip_state)


async def savings_options(trip_state: dict, target: int) -> dict:
    return await call_tool("optimize_trip_budget", trip_state=trip_state, target=target)
