"""Password hashing + JWT access/refresh tokens. Secrets never leave the server."""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _pwd.verify(password, password_hash)


def _encode(payload: dict, expires: timedelta) -> str:
    settings = get_settings()
    data = {**payload, "exp": datetime.now(timezone.utc) + expires}
    return jwt.encode(data, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str) -> str:
    settings = get_settings()
    return _encode({"sub": user_id, "type": "access"}, timedelta(minutes=settings.access_token_minutes))


def create_refresh_token(user_id: str) -> str:
    settings = get_settings()
    return _encode({"sub": user_id, "type": "refresh"}, timedelta(days=settings.refresh_token_days))


def decode_token(token: str, expected_type: str = "access") -> str | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
    if payload.get("type") != expected_type:
        return None
    sub = payload.get("sub")
    return str(sub) if sub else None
