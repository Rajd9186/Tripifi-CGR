from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Booking, User
from app.routers.deps import get_current_user
from app.schemas.schemas import BookingCreate, BookingOut
from app.services.booking_service import create_booking

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=201)
async def create(body: BookingCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        booking = await create_booking(db, user.id, UUID(body.trip_id), body.idempotency_key)
    except ValueError as e:
        if str(e) == "TRIP_NOT_FOUND":
            raise HTTPException(status_code=404, detail="Trip not found")
        raise
    return BookingOut(
        id=booking.id, status=booking.status.value, total_amount=booking.total_amount,
        currency=booking.currency, provider_reference=booking.provider_reference,
    )


@router.get("", response_model=list[BookingOut])
async def list_bookings(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (await db.execute(select(Booking).where(Booking.user_id == user.id).order_by(Booking.created_at.desc()))).scalars().all()
    return [
        BookingOut(
            id=b.id, status=b.status.value, total_amount=b.total_amount,
            currency=b.currency, provider_reference=b.provider_reference,
        )
        for b in rows
    ]


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(booking_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    booking = (
        await db.execute(select(Booking).where(Booking.id == booking_id, Booking.user_id == user.id))
    ).scalar_one_or_none()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return BookingOut(
        id=booking.id, status=booking.status.value, total_amount=booking.total_amount,
        currency=booking.currency, provider_reference=booking.provider_reference,
    )
