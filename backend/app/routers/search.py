"""Search API. All endpoints return the standard envelope; providers stay swappable."""

from fastapi import APIRouter, Request

from app.schemas.schemas import SearchRequest
from app.services.search import activity_service, cab_service, destination_service, flight_service, hotel_service, train_service
from app.services.search.base import SearchError, error_envelope

router = APIRouter(prefix="/search", tags=["search"])


def _rid(request: Request) -> str:
    return getattr(request.state, "request_id", "req-unknown")


def _filters(body: dict) -> dict:
    return {k: v for k, v in (body.get("filters") or {}).items() if v is not None}


@router.post("")
async def unified_search(body: SearchRequest, request: Request):
    rid = _rid(request)
    try:
        if body.type == "flight":
            return await flight_service.search_flights(body.model_dump(), rid)
        if body.type == "train":
            return await train_service.search_trains(body.model_dump(), rid)
        if body.type == "hotel":
            return await hotel_service.search_hotels(body.model_dump(), rid)
        if body.type == "cab":
            return await cab_service.search_cabs(body.model_dump(), rid)
        if body.type == "activity":
            return await activity_service.search_activities(body.model_dump(), rid)
        return {"success": False, "data": None, "error": {"code": "INVALID_SEARCH", "message": "Unknown search type."}, "requestId": rid}
    except SearchError as e:
        return error_envelope(e.code, rid, e.detail)


@router.post("/flights")
async def search_flights(body: dict, request: Request):
    rid = _rid(request)
    try:
        return await flight_service.search_flights(body, rid, _filters(body), str(body.get("sort", "recommended")))
    except SearchError as e:
        return error_envelope(e.code, rid, e.detail)


@router.post("/trains")
async def search_trains(body: dict, request: Request):
    rid = _rid(request)
    try:
        return await train_service.search_trains(body, rid, _filters(body), str(body.get("sort", "recommended")))
    except SearchError as e:
        return error_envelope(e.code, rid, e.detail)


@router.post("/hotels")
async def search_hotels(body: dict, request: Request):
    rid = _rid(request)
    try:
        return await hotel_service.search_hotels(body, rid, _filters(body), str(body.get("sort", "recommended")))
    except SearchError as e:
        return error_envelope(e.code, rid, e.detail)


@router.post("/cabs")
async def search_cabs(body: dict, request: Request):
    rid = _rid(request)
    try:
        return await cab_service.search_cabs(body, rid, _filters(body), str(body.get("sort", "recommended")))
    except SearchError as e:
        return error_envelope(e.code, rid, e.detail)


@router.post("/activities")
async def search_activities(body: dict, request: Request):
    rid = _rid(request)
    try:
        return await activity_service.search_activities(body, rid)
    except SearchError as e:
        return error_envelope(e.code, rid, e.detail)


@router.post("/destinations")
async def search_destinations(body: dict, request: Request):
    rid = _rid(request)
    results = destination_service.search_destinations(body)
    if not results:
        return error_envelope("NO_RESULTS", rid)
    return {
        "success": True,
        "data": {"results": results, "provider": {"name": "tripifi-catalog", "status": "DEMO"}},
        "error": None,
        "requestId": rid,
    }
