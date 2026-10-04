from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Trip, TripActivity, TripDestination, TripHotel, TripItineraryItem, TripRestaurant, TripStatus, TripTransport, User
from app.routers.deps import get_current_user
from app.schemas.schemas import (
    ActivityAdd,
    DestinationAdd,
    HotelAdd,
    ItineraryAdd,
    ItineraryPatch,
    TransportAdd,
    TripCreate,
    TripOut,
    TripUpdate,
)

router = APIRouter(prefix="/trips", tags=["trips"])


def _out(t: Trip) -> TripOut:
    return TripOut(
        id=t.id, name=t.name, origin=t.origin, start_date=t.start_date,
        end_date=t.end_date, travellers=t.travellers, status=t.status.value,
        total_amount=t.total_amount, currency=t.currency, created_at=t.created_at,
    )


async def _owned_trip(db: AsyncSession, user: User, trip_id: UUID) -> Trip:
    trip = (await db.execute(select(Trip).where(Trip.id == trip_id, Trip.user_id == user.id))).scalar_one_or_none()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("", response_model=TripOut, status_code=201)
async def create_trip(body: TripCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = Trip(
        user_id=user.id, name=body.name, origin=body.origin,
        start_date=body.start_date, end_date=body.end_date,
        travellers=body.travellers, status=TripStatus.DRAFT,
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return _out(trip)


@router.get("", response_model=list[TripOut])
async def list_trips(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (await db.execute(select(Trip).where(Trip.user_id == user.id).order_by(Trip.created_at.desc()))).scalars().all()
    return [_out(t) for t in rows]


@router.get("/{trip_id}", response_model=TripOut)
async def get_trip(trip_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    return _out(await _owned_trip(db, user, trip_id))


@router.patch("/{trip_id}", response_model=TripOut)
async def patch_trip(trip_id: UUID, body: TripUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    if body.name is not None:
        trip.name = body.name
    if body.origin is not None:
        trip.origin = body.origin
    if body.start_date is not None:
        trip.start_date = body.start_date
    if body.end_date is not None:
        trip.end_date = body.end_date
    if body.travellers is not None:
        trip.travellers = body.travellers
    if body.status is not None:
        trip.status = TripStatus(body.status)
    await db.commit()
    await db.refresh(trip)
    return _out(trip)


@router.delete("/{trip_id}", status_code=204)
async def delete_trip(trip_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    await db.delete(trip)
    await db.commit()
    return None


@router.post("/{trip_id}/destinations", status_code=201)
async def add_destination(trip_id: UUID, body: DestinationAdd, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    count = len((await db.execute(select(TripDestination).where(TripDestination.trip_id == trip.id))).scalars().all())
    db.add(TripDestination(trip_id=trip.id, destination_slug=body.destination_slug, position=count))
    await db.commit()
    return {"ok": True}


@router.delete("/{trip_id}/destinations/{dest_id}", status_code=204)
async def remove_destination(trip_id: UUID, dest_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    row = (await db.execute(select(TripDestination).where(TripDestination.id == dest_id, TripDestination.trip_id == trip.id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    await db.delete(row)
    await db.commit()
    return None


@router.post("/{trip_id}/itinerary", status_code=201)
async def add_itinerary(trip_id: UUID, body: ItineraryAdd, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    db.add(TripItineraryItem(trip_id=trip.id, day=body.day, kind=body.kind, title=body.title, details=body.details, amount=body.amount))
    trip.total_amount += body.amount
    await db.commit()
    return {"ok": True}


@router.patch("/{trip_id}/itinerary/{item_id}")
async def patch_itinerary(trip_id: UUID, item_id: UUID, body: ItineraryPatch, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    item = (await db.execute(select(TripItineraryItem).where(TripItineraryItem.id == item_id, TripItineraryItem.trip_id == trip.id))).scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    old = item.amount
    if body.day is not None:
        item.day = body.day
    if body.title is not None:
        item.title = body.title
    if body.details is not None:
        item.details = body.details
    if body.amount is not None:
        item.amount = body.amount
    trip.total_amount += (item.amount - old)
    await db.commit()
    return {"ok": True}


@router.delete("/{trip_id}/itinerary/{item_id}", status_code=204)
async def delete_itinerary(trip_id: UUID, item_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    item = (await db.execute(select(TripItineraryItem).where(TripItineraryItem.id == item_id, TripItineraryItem.trip_id == trip.id))).scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    trip.total_amount -= item.amount
    await db.delete(item)
    await db.commit()
    return None


@router.post("/{trip_id}/transport", status_code=201)
async def add_transport(trip_id: UUID, body: TransportAdd, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    db.add(TripTransport(trip_id=trip.id, kind=body.kind, provider=body.provider, offer_id=body.offer_id, title=body.title, amount=body.amount))
    trip.total_amount += body.amount
    await db.commit()
    return {"ok": True}


@router.delete("/{trip_id}/transport/{transport_id}", status_code=204)
async def remove_transport(trip_id: UUID, transport_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    row = (await db.execute(select(TripTransport).where(TripTransport.id == transport_id, TripTransport.trip_id == trip.id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Transport not found")
    trip.total_amount -= row.amount
    await db.delete(row)
    await db.commit()
    return None


@router.post("/{trip_id}/hotels", status_code=201)
async def add_hotel(trip_id: UUID, body: HotelAdd, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    db.add(TripHotel(trip_id=trip.id, provider=body.provider, offer_id=body.offer_id, name=body.name, amount=body.amount))
    trip.total_amount += body.amount
    await db.commit()
    return {"ok": True}


@router.delete("/{trip_id}/hotels/{hotel_id}", status_code=204)
async def remove_hotel(trip_id: UUID, hotel_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    row = (await db.execute(select(TripHotel).where(TripHotel.id == hotel_id, TripHotel.trip_id == trip.id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    trip.total_amount -= row.amount
    await db.delete(row)
    await db.commit()
    return None


@router.post("/{trip_id}/activities", status_code=201)
async def add_activity(trip_id: UUID, body: ActivityAdd, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    db.add(TripActivity(trip_id=trip.id, title=body.title, amount=body.amount))
    trip.total_amount += body.amount
    await db.commit()
    return {"ok": True}


@router.delete("/{trip_id}/activities/{activity_id}", status_code=204)
async def remove_activity(trip_id: UUID, activity_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    trip = await _owned_trip(db, user, trip_id)
    row = (await db.execute(select(TripActivity).where(TripActivity.id == activity_id, TripActivity.trip_id == trip.id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    trip.total_amount -= row.amount
    await db.delete(row)
    await db.commit()
    return None


@router.get("/{trip_id}/price")
async def trip_price(trip_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    from app.services.pricing import calculate_snapshot

    trip = await _owned_trip(db, user, trip_id)
    return calculate_snapshot(hotels=trip.total_amount, travellers=trip.travellers)
