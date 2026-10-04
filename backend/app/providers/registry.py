"""ProviderRegistry. Routes never instantiate providers directly.

Selection is env-driven: 'demo' (default) or 'disabled'.
Future real adapters plug in here without touching services, AI, or UI.
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


def _select(configured: str, demo_factory, label: str):
    if configured == "demo":
        return demo_factory()
    if configured == "disabled":
        return ProviderDisabled()
    raise ValueError(f"Unknown {label} provider: {configured!r} (expected 'demo' or 'disabled')")


def get_flight_provider():
    return _select(get_settings().flight_provider, DemoFlightProvider, "flight")


def get_train_provider():
    return _select(get_settings().train_provider, DemoTrainProvider, "train")


def get_hotel_provider():
    return _select(get_settings().hotel_provider, DemoHotelProvider, "hotel")


def get_cab_provider():
    return _select(get_settings().cab_provider, DemoCabProvider, "cab")


def get_activity_provider():
    return DemoActivityProvider()


def get_routing_provider():
    return _select(get_settings().routing_provider, DemoRoutingProvider, "routing")


def get_package_provider():
    return DemoPackageProvider()


def provider_status(name: str, configured: str, bookable: bool = False) -> dict:
    if configured == "disabled":
        state = "UNAVAILABLE"
    elif configured == "demo":
        state = "DEMO"
    else:
        state = "ERROR"
    return {"provider": name, "mode": configured, "state": state, "bookable": bookable}


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
        provider_status("packages", "demo", bookable=True),
    ]
