"""Tripifi internal cab pricing. Routing distance in, honest estimate out.

No cab-booking API exists, so fares are ALWAYS labeled 'Estimated fare'
unless a real booking provider later confirms the price.
"""

TRIP_TYPES = {"local", "airport", "oneway", "roundtrip", "multiday"}

VEHICLES: dict[str, dict] = {
    "sedan": {"base": 1800, "included_km": 100, "per_km": 12, "night": 300},
    "suv": {"base": 2600, "included_km": 150, "per_km": 15, "night": 400},
    "premium": {"base": 4500, "included_km": 150, "per_km": 22, "night": 600},
    "luxury": {"base": 8000, "included_km": 120, "per_km": 35, "night": 1000},
}

TAX_RATE = 0.05


def estimate_fare(
    distance_km: float,
    vehicle: str = "sedan",
    trip_type: str = "oneway",
    tolls: int = 0,
    night_halt: bool = False,
) -> dict:
    v = VEHICLES.get(vehicle, VEHICLES["sedan"])
    if trip_type not in TRIP_TYPES:
        trip_type = "oneway"
    distance = max(0.0, float(distance_km))
    if trip_type == "roundtrip":
        distance *= 2
    if trip_type == "multiday":
        distance = max(distance, 250.0)

    extra_km = max(0.0, distance - v["included_km"])
    base = v["base"]
    extra = round(extra_km * v["per_km"])
    night = v["night"] if night_halt else 0
    driver_allowance = 300 if distance > 100 else 0
    subtotal = base + extra + night + driver_allowance + tolls
    taxes = int(round(subtotal * TAX_RATE))
    total = subtotal + taxes
    return {
        "vehicle": vehicle,
        "trip_type": trip_type,
        "distance_km": round(distance, 1),
        "included_km": v["included_km"],
        "extra_km": round(extra_km, 1),
        "base_fare": base,
        "extra_km_charge": extra,
        "driver_allowance": driver_allowance,
        "night_charge": night,
        "toll_estimate": tolls,
        "taxes": taxes,
        "total": total,
        "currency": "INR",
        "label": "Estimated fare",
        "is_demo": False,
    }
