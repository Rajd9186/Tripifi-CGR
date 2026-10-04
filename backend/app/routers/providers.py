"""Provider health + package catalog through the provider layer."""

from fastapi import APIRouter, HTTPException

from app.providers import registry

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/health")
async def health():
    return {"providers": registry.get_provider_health()}


packages_router = APIRouter(prefix="/packages", tags=["packages"])


@packages_router.get("")
async def list_packages():
    provider = registry.get_package_provider()
    return {"results": [p.model_dump() for p in await provider.list()]}


@packages_router.get("/{slug}")
async def get_package(slug: str):
    provider = registry.get_package_provider()
    pkg = await provider.get(slug)
    if pkg is None:
        raise HTTPException(status_code=404, detail="Package not found")
    return pkg.model_dump()
