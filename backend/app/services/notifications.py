"""Notification + email abstractions. Dashboard delivery always works;
email sends only when a provider is configured — the app never breaks.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.models import Notification


async def notify_dashboard(db: AsyncSession, user_id, kind: str, title: str, body: str) -> None:
    db.add(Notification(user_id=user_id, kind=kind, title=title, body=body))


async def notify_admin_new_enquiry(reference: str, service: str, destination: str) -> dict:
    settings = get_settings()
    # Email is optional/configurable for Phase 5; dashboard notification is the guarantee.
    if settings.email_provider == "none" or not settings.admin_email:
        return {"emailed": False, "reason": "email provider not configured"}
    # Real provider integration point (SMTP/API) goes here.
    return {"emailed": False, "reason": "email provider not connected"}


async def send_customer_confirmation(email: str, reference: str, service: str) -> dict:
    settings = get_settings()
    if settings.email_provider == "none" or not email:
        return {"emailed": False, "reason": "email provider not configured"}
    return {"emailed": False, "reason": "email provider not connected"}
