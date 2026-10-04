from fastapi import APIRouter

from app.providers.demo import DemoCabProvider, DemoFlightProvider, DemoHotelProvider, DemoTrainProvider
from app.schemas.schemas import SearchRequest
from app.services.cache import get_cache

router = APIRouter(prefix="/search", tags=["search"])


@router.post("")
async def unified_search(body: SearchRequest):
    """Single search entrypoint. Provider behind it can change without touching the frontend."""
    cache = get_cache()
    key = f"search:{body.type}:{body.origin}:{body.destination}:{body.departure_date}"
    cached = await cache.get(key)
    if cached is not None:
        return cached

    if body.type == "flight":
        results = await DemoFlightProvider().search(body.origin or "CCU", body.destination or "DEL", body.departure_date, body.travellers)
        payload = {"type": "flight", "results": [r.model_dump() for r in results]}
    elif body.type == "train":
        results = await DemoTrainProvider().search(body.origin or "HWH", body.destination or "NDLS", body.departure_date)
        payload = {"type": "train", "results": [r.model_dump() for r in results]}
    elif body.type == "hotel":
        results = await DemoHotelProvider().search(body.destination or "Gangtok")
        payload = {"type": "hotel", "results": [r.model_dump() for r in results]}
    elif body.type == "cab":
        results = await DemoCabProvider().search(body.origin or "Kolkata Airport", body.destination or "Park Street")
        payload = {"type": "cab", "results": [r.model_dump() for r in results]}
    else:
        payload = {"type": body.type, "results": []}

    await cache.set(key, payload, ttl_seconds=120)
    return payload


@router.post("/flights")
async def search_flights(body: SearchRequest):
    results = await DemoFlightProvider().search(body.origin or "CCU", body.destination or "DEL", body.departure_date, body.travellers)
    return {"results": [r.model_dump() for r in results]}


@router.post("/trains")
async def search_trains(body: SearchRequest):
    results = await DemoTrainProvider().search(body.origin or "HWH", body.destination or "NDLS", body.departure_date)
    return {"results": [r.model_dump() for r in results]}


@router.post("/hotels")
async def search_hotels(body: SearchRequest):
    results = await DemoHotelProvider().search(body.destination or "Gangtok")
    return {"results": [r.model_dump() for r in results]}


@router.post("/cabs")
async def search_cabs(body: SearchRequest):
    results = await DemoCabProvider().search(body.origin or "Kolkata Airport", body.destination or "Park Street")
    return {"results": [r.model_dump() for r in results]}
