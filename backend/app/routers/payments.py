from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Booking, Payment, PaymentStatus, User
from app.providers.demo import DemoPaymentProvider
from app.routers.deps import get_current_user
from app.schemas.schemas import PaymentCreate, PaymentOut

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", response_model=PaymentOut, status_code=201)
async def create_payment(body: PaymentCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        booking_id = UUID(body.booking_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid booking id")
    booking = (
        await db.execute(select(Booking).where(Booking.id == booking_id, Booking.user_id == user.id))
    ).scalar_one_or_none()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    if body.idempotency_key:
        existing = (
            await db.execute(select(Payment).where(Payment.idempotency_key == body.idempotency_key))
        ).scalar_one_or_none()
        if existing is not None:
            return PaymentOut(
                id=existing.id, status=existing.status.value, amount=existing.amount,
                provider=existing.provider, payment_reference=existing.payment_reference,
            )

    # Demo provider: clearly simulated, never real money movement.
    created = await DemoPaymentProvider().create_payment(booking.total_amount, booking.currency, body.idempotency_key)
    payment = Payment(
        user_id=user.id, booking_id=booking.id, provider="demo",
        payment_reference=str(created["payment_reference"]), amount=booking.total_amount,
        currency=booking.currency, status=PaymentStatus.PENDING,
        idempotency_key=body.idempotency_key,
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return PaymentOut(
        id=payment.id, status=payment.status.value, amount=payment.amount,
        provider=payment.provider, payment_reference=payment.payment_reference,
    )


@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    payment = (
        await db.execute(select(Payment).where(Payment.id == payment_id, Payment.user_id == user.id))
    ).scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentOut(
        id=payment.id, status=payment.status.value, amount=payment.amount,
        provider=payment.provider, payment_reference=payment.payment_reference,
    )
