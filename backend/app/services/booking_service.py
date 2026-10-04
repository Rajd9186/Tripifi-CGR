"""Booking creation with idempotency + transactional semantics."""

import json
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Booking, BookingItem, BookingStatus, Trip, TripStatus
from app.services.pricing import calculate_snapshot


async def create_booking(
    db: AsyncSession,
    user_id: UUID,
    trip_id: UUID,
    idempotency_key: str | None,
) -> Booking:
    # Idempotency: retries with the same key return the original booking.
    if idempotency_key:
        existing = (
            await db.execute(select(Booking).where(Booking.idempotency_key == idempotency_key))
        ).scalar_one_or_none()
        if existing is not None:
            return existing

    trip = (await db.execute(select(Trip).where(Trip.id == trip_id))).scalar_one_or_none()
    if trip is None:
        raise ValueError("TRIP_NOT_FOUND")

    snapshot = calculate_snapshot(hotels=trip.total_amount, travellers=trip.travellers)

    booking = Booking(
        user_id=user_id,
        trip_id=trip.id,
        status=BookingStatus.PENDING,
        total_amount=snapshot.total,
        currency=trip.currency,
        provider_reference=None,
        idempotency_key=idempotency_key,
        price_snapshot=json.dumps(snapshot.model_dump(mode="json")),
    )
    db.add(booking)
    await db.flush()

    db.add(
        BookingItem(
            booking_id=booking.id,
            kind="trip",
            title=trip.name,
            amount=snapshot.total,
        )
    )
    trip.status = TripStatus.PAYMENT_PENDING
    await db.commit()
    await db.refresh(booking)
    return booking
