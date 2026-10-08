from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.providers import registry
from app.routers import admin_enquiries, ai, auth, bookings, enquiries, geo, payments, search, trips, webhooks, wishlist
from app.routers.providers import packages_router, router as providers_router
from app.utils.request_id import RequestIDMiddleware

settings = get_settings()

app = FastAPI(
    title="Tripifi CGR API",
    description="Journey-centric travel platform API. Demo providers return is_demo inventory.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "Idempotency-Key"],
)


@app.exception_handler(Exception)
async def unhandled_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "req-unknown")
    # Never leak stack traces to clients.
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "Something went wrong.", "request_id": request_id}},
    )


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.environment}


@app.on_event("startup")
async def validate_provider_config() -> None:
    # Fail fast on unknown adapter names — never at request time.
    registry.validate_registry()


api = APIRouter(prefix="/api/v1")
api.include_router(auth.router)
api.include_router(trips.router)
api.include_router(search.router)
api.include_router(packages_router)
api.include_router(providers_router)
api.include_router(bookings.router)
api.include_router(payments.router)
api.include_router(wishlist.router)
api.include_router(ai.router)
api.include_router(webhooks.router)
api.include_router(enquiries.router)
api.include_router(admin_enquiries.router)
api.include_router(geo.router)
app.include_router(api)
