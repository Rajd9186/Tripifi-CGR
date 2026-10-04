from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = "postgresql+psycopg://tripifi:tripifi@localhost:5432/tripifi"
    secret_key: str = "change-me"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_days: int = 14

    frontend_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000"

    ai_provider: str = "demo"
    ai_api_key: str = ""
    ai_model: str = "tripifi-demo-planner"

    flight_api_key: str = ""
    hotel_api_key: str = ""
    maps_api_key: str = ""
    payment_api_key: str = ""
    payment_provider: str = "demo"
    payment_webhook_secret: str = ""

    # Phase 7 AI core — Ollama-first, future providers optional
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:3b"
    ollama_timeout: int = 60
    ai_temperature: float = 0.3
    ai_max_tokens: int = 2000
    ai_max_tool_calls: int = 6
    ai_streaming_enabled: bool = True
    groq_api_key: str = ""
    nvidia_api_key: str = ""

    # Phase 5 — free-first provider selection (env-driven, replaceable)
    flight_provider: str = "demo"
    train_provider: str = "demo"
    hotel_provider: str = "demo"
    cab_provider: str = "demo"
    map_provider: str = "demo"
    routing_provider: str = "demo"
    geocoding_provider: str = "nominatim"
    aviation_api_key: str = ""
    graphhopper_api_key: str = ""
    osrm_base_url: str = "https://router.project-osrm.org"
    nominatim_base_url: str = "https://nominatim.openstreetmap.org"

    email_provider: str = "none"
    email_api_key: str = ""
    admin_email: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
