"""Idempotent webhook receivers. Signature validation happens here before any state change."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.models.models import Booking, BookingStatus, Payment, PaymentStatus

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/payment")
async def payment_webhook(
    body: dict,
    db: AsyncSession = Depends(get_db),
    x_signature: str | None = Header(default=None),
):
    settings = get_settings()
    # In demo mode there is no signed sender; in production a missing/invalid
    # signature must reject. Never process the same event twice.
    if settings.is_production and x_signature != settings.payment_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid signature")

    reference = str(body.get("payment_reference", ""))
    status = str(body.get("status", "")).upper()
    if not reference:
        raise HTTPException(status_code=400, detail="Missing payment_reference")

    payment = (
        await db.execute(select(Payment).where(Payment.payment_reference == reference))
    ).scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    if status == "SUCCESS" and payment.status != PaymentStatus.SUCCESS:
        payment.status = PaymentStatus.SUCCESS
        if payment.booking_id is not None:
            booking = (
                await db.execute(select(Booking).where(Booking.id == payment.booking_id))
            ).scalar_one_or_none()
            if booking is not None:
                booking.status = BookingStatus.CONFIRMED
                booking.provider_reference = reference
    elif status == "FAILED":
        payment.status = PaymentStatus.FAILED
    await db.commit()
    return {"ok": True}
