"""ProviderRegistry. Routes never instantiate providers directly.

Selection is env-driven per service, with comma-separated fallback chains,
e.g. ROUTING_PROVIDER=osrm,estimate. Unknown names fail fast — at startup
via validate_registry() and at selection time — never silently at request
time. Demo stays the default when nothing is configured.
"""

from app.core.config import get_settings
from app.providers.cabs.demo import DemoCabProvider
from app.providers.flights.demo import DemoFlightProvider
from app.providers.hotels.demo import DemoHotelProvider
from app.providers.packages.demo import DemoPackageProvider
from app.providers.activities.demo import DemoActivityProvider
from app.providers.routing.demo import DemoRoutingProvider
from app.providers.trains.demo import DemoTrainProvider


class ProviderDisabled:
    name = "disabled"


def _demo_geocoding():
    from app.providers.free import NominatimGeocodingProvider

    # "demo" geocoding intentionally resolves via Nominatim: coordinates must
    # be real for downstream routing/estimates to stay honest.
    return NominatimGeocodingProvider()


def _demo_weather():
    from app.providers.weather.demo import DemoWeatherProvider

    return DemoWeatherProvider()


# service -> adapter name -> factory (real adapters lazy-imported).
ADAPTERS: dict[str, dict[str, object]] = {
    "flight": {
        "demo": DemoFlightProvider,
        "disabled": ProviderDisabled,
        "aviationstack": lambda: __import__(
            "app.providers.free", fromlist=["AviationstackFlightProvider"]
        ).AviationstackFlightProvider(),
    },
    "train": {
        "demo": DemoTrainProvider,
        "disabled": ProviderDisabled,
        # No legitimate free live-train API: no live adapter by design.
    },
    "hotel": {
        "demo": DemoHotelProvider,
        "disabled": ProviderDisabled,
        "overpass": lambda: __import__(
            "app.providers.hotels.overpass", fromlist=["OverpassHotelProvider"]
        ).OverpassHotelProvider(),
    },
    "cab": {
        # Internal estimator (routing distance x rate card). "tripifi" kept
        # as an alias because .env.example historically used it.
        "demo": DemoCabProvider,
        "tripifi": DemoCabProvider,
        "estimate": DemoCabProvider,
        "disabled": ProviderDisabled,
    },
    "activity": {
        "demo": DemoActivityProvider,
        "disabled": ProviderDisabled,
        "overpass": lambda: __import__(
            "app.providers.activities.overpass", fromlist=["OverpassActivityProvider"]
        ).OverpassActivityProvider(),
    },
    "routing": {
        "demo": DemoRoutingProvider,
        "disabled": ProviderDisabled,
        "osrm": lambda: __import__(
            "app.providers.free", fromlist=["OSRMRoutingProvider"]
        ).OSRMRoutingProvider(),
        "estimate": lambda: __import__(
            "app.providers.routing.estimate", fromlist=["EstimateRoutingProvider"]
        ).EstimateRoutingProvider(),
    },
    "geocoding": {
        "nominatim": lambda: __import__(
            "app.providers.free", fromlist=["NominatimGeocodingProvider"]
        ).NominatimGeocodingProvider(),
        "demo": _demo_geocoding,
        "disabled": ProviderDisabled,
    },
    "weather": {
        "demo": _demo_weather,
        "disabled": ProviderDisabled,
        "open_meteo": lambda: __import__(
            "app.providers.weather.open_meteo", fromlist=["OpenMeteoWeatherProvider"]
        ).OpenMeteoWeatherProvider(),
    },
    "packages": {
        "demo": DemoPackageProvider,
    },
}

_SERVICE_SETTING = {
    "flight": "flight_provider",
    "train": "train_provider",
    "hotel": "hotel_provider",
    "cab": "cab_provider",
    "activity": "activity_provider",
    "routing": "routing_provider",
    "geocoding": "geocoding_provider",
    "weather": "weather_provider",
    "packages": "map_provider",
}


def parse_chain(raw: str | None) -> list[str]:
    return [p.strip().lower() for p in (raw or "").split(",") if p.strip()]


def _select(configured: str, demo_factory, label: str):
    """Legacy single-name selector. Kept for backward compatibility."""
    if configured == "demo":
        return demo_factory()
    if configured == "disabled":
        return ProviderDisabled()
    raise ValueError(f"Unknown {label} provider: {configured!r} (expected 'demo' or 'disabled')")


def _configured_chain(service: str) -> list[str]:
    setting = _SERVICE_SETTING[service]
    return parse_chain(getattr(get_settings(), setting, "demo") or "demo")


def get_provider_chain(service: str) -> list:
    """Instantiate the configured fallback chain for a service, in order."""
    table = ADAPTERS.get(service)
    if table is None:
        raise ValueError(f"Unknown service: {service!r}")
    chain = _configured_chain(service) or ["demo"]
    providers = []
    for name in chain:
        factory = table.get(name)
        if factory is None:
            valid = ", ".join(sorted(table))
            raise ValueError(
                f"Unknown {service} provider: {name!r} (expected one of: {valid})"
            )
        providers.append(factory())
    return providers


def _first(service: str, legacy_demo_factory, label: str):
    chain = _configured_chain(service)
    if len(chain) == 1 and chain[0] in ("demo", "disabled"):
        return _select(chain[0], legacy_demo_factory, label)
    return get_provider_chain(service)[0]


def get_flight_provider():
    return _first("flight", DemoFlightProvider, "flight")


def get_train_provider():
    return _first("train", DemoTrainProvider, "train")


def get_hotel_provider():
    return _first("hotel", DemoHotelProvider, "hotel")


def get_cab_provider():
    return _first("cab", DemoCabProvider, "cab")


def get_activity_provider():
    return _first("activity", DemoActivityProvider, "activity")


def get_routing_provider():
    return _first("routing", DemoRoutingProvider, "routing")


def get_geocoding_provider():
    return get_provider_chain("geocoding")[0]


def get_weather_provider():
    return _first("weather", _demo_weather, "weather")


def get_package_provider():
    return DemoPackageProvider()


# Adapters that need an API key *and* an explicit paid opt-in to serve.


def _adapter_configured(service: str, name: str) -> bool:
    settings = get_settings()
    if name in ("demo", "disabled"):
        return True
    if name == "aviationstack":
        return bool(settings.aviation_api_key and settings.aviationstack_paid_key)
    return True


def provider_status(name: str, configured: str, bookable: bool = False) -> dict:
    first = parse_chain(configured)[0] if parse_chain(configured) else "demo"
    if first == "disabled":
        state = "UNAVAILABLE"
    elif first == "demo":
        state = "DEMO"
    elif not _adapter_configured(name, first):
        state = "NOT_CONFIGURED"
    else:
        state = "SUCCESS"
    return {"provider": name, "mode": configured, "state": state, "bookable": bookable}


def validate_registry() -> dict[str, list[str]]:
    """Fail fast at startup on unknown adapter names. Returns resolved chains."""
    resolved: dict[str, list[str]] = {}
    for service, table in ADAPTERS.items():
        setting = _SERVICE_SETTING.get(service)
        raw = getattr(get_settings(), setting, "demo") if setting else "demo"
        chain = parse_chain(raw) or ["demo"]
        unknown = [n for n in chain if n not in table]
        if unknown:
            valid = ", ".join(sorted(table))
            raise ValueError(
                f"Invalid provider chain for {service}: {unknown!r} "
                f"(setting {_SERVICE_SETTING.get(service)}, expected names from: {valid})"
            )
        resolved[service] = chain
    return resolved


def get_provider_health() -> list[dict]:
    settings = get_settings()
    cab_mode = getattr(settings, "cab_provider", "demo")
    return [
        provider_status("flights", settings.flight_provider),
        provider_status("trains", settings.train_provider),
        provider_status("hotels", settings.hotel_provider),
        provider_status("cabs", cab_mode),
        provider_status("activities", "demo"),
        provider_status("routing", settings.routing_provider),
        provider_status("geocoding", getattr(settings, "geocoding_provider", "nominatim")),
        provider_status("weather", getattr(settings, "weather_provider", "demo")),
        provider_status("packages", "demo", bookable=True),
    ]
