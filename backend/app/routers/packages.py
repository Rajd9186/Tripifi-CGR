from fastapi import APIRouter

router = APIRouter(prefix="/packages", tags=["packages"])

PACKAGES = [
    {
        "slug": "sikkim-escape",
        "title": "Sikkim Escape",
        "destination": "Sikkim",
        "duration": "5 Nights / 6 Days",
        "route": "NJP → Gangtok → Pelling → NJP",
        "base_price": 69998,
        "currency": "INR",
        "tags": ["mountains", "honeymoon", "comfortable"],
        "inclusions": ["Hotel", "Breakfast", "Private Cab", "Sightseeing", "Transfers"],
        "is_demo": True,
    },
    {
        "slug": "kashmir-paradise",
        "title": "Kashmir Paradise",
        "destination": "Kashmir",
        "duration": "5 Nights / 6 Days",
        "route": "Srinagar → Gulmarg → Pahalgam",
        "base_price": 42999,
        "currency": "INR",
        "tags": ["lakes", "scenic", "luxury"],
        "inclusions": ["Houseboat/Hotel", "Breakfast", "Cab", "Sightseeing"],
        "is_demo": True,
    },
]


@router.get("")
async def list_packages():
    return {"results": PACKAGES}


@router.get("/{slug}")
async def get_package(slug: str):
    for p in PACKAGES:
        if p["slug"] == slug:
            return p
    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail="Package not found")
