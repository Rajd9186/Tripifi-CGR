"""Customer booking-enquiry endpoints. Public creation, gated status lookup."""

import json
import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Enquiry, EnquiryStatus, EnquiryStatusHistory, EnquiryType
from app.schemas.schemas import EnquiryCreate, EnquiryOut
from app.services.notifications import notify_admin_new_enquiry, send_customer_confirmation
from app.services.rate_limit import check_rate_limit

router = APIRouter(prefix="/enquiries", tags=["enquiries"])

PHONE_RE = re.compile(r"^(?:\+91[\-\s]?)?[6-9]\d{9}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def normalize_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if len(digits) != 10 or not PHONE_RE.match(raw.strip()) and not re.match(r"^[6-9]\d{9}$", digits):
        raise ValueError("INVALID_PHONE")
    return f"+91{digits}"


def _out(e: Enquiry) -> EnquiryOut:
    return EnquiryOut(
        id=str(e.id), reference_number=e.reference_number, type=e.type.value,
        status=e.status.value, customer_name=e.customer_name, origin=e.origin,
        destination=e.destination, travel_start_date=e.travel_start_date,
        travel_end_date=e.travel_end_date, traveller_count=e.traveller_count,
        created_at=e.created_at,
    )


def honeypot_tripped(body: EnquiryCreate) -> bool:
    """Hidden field real users never fill. Bots do."""
    return bool((body.website or "").strip())


def validate_enquiry_input(body: EnquiryCreate) -> dict:
    """Validate name/phone/email/consent/dates. Returns normalized fields.

    Raises HTTPException(400) with a user-friendly message. Never logs PII.
    """
    if honeypot_tripped(body):
        raise HTTPException(status_code=400, detail="Unable to submit your request right now. Please try again.")
    try:
        etype = EnquiryType(body.type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid enquiry type")
    try:
        phone = normalize_phone(body.phone)
    except ValueError:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit Indian mobile number.")
    email = (body.email or "").strip().lower() or None
    if email is not None and not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if not body.customer_name.strip() or len(body.customer_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not body.consent:
        raise HTTPException(status_code=400, detail="Please agree to be contacted about this enquiry.")
    if body.travel_start_date and body.travel_end_date and body.travel_end_date < body.travel_start_date:
        raise HTTPException(status_code=400, detail="Return date must be on or after the travel date.")
    if body.traveller_count < 1:
        raise HTTPException(status_code=400, detail="Traveller count must be at least 1.")
    return {
        "etype": etype,
        "phone": phone,
        "email": email,
        "preferred_contact_time": (body.preferred_contact_time or None),
    }


@router.post("", response_model=EnquiryOut, status_code=201)
async def create_enquiry(body: EnquiryCreate, db: AsyncSession = Depends(get_db)):
    # Rate limit: same phone, short window → probable duplicate.
    if not check_rate_limit(f"enquiry:{body.phone}:{body.type}", max_hits=3, window_seconds=600):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait before submitting again.")
    if not check_rate_limit("enquiry:global", max_hits=60, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    checked = validate_enquiry_input(body)
    etype, phone, email = checked["etype"], checked["phone"], checked["email"]

    # Idempotency: accidental double-click must not create two enquiries.
    if body.idempotency_key:
        existing = (
            await db.execute(select(Enquiry).where(Enquiry.idempotency_key == body.idempotency_key))
        ).scalar_one_or_none()
        if existing is not None:
            return _out(existing)

    # Duplicate guard: same phone + type + destination + start date within 10 min.
    recent = (
        await db.execute(
            select(Enquiry).where(
                Enquiry.phone == phone,
                Enquiry.type == etype,
                Enquiry.destination == (body.destination or None),
                Enquiry.travel_start_date == (body.travel_start_date or None),
            )
        )
    ).scalars().all()
    now = datetime.utcnow()
    for r in recent:
        created = r.created_at.replace(tzinfo=None) if r.created_at.tzinfo else r.created_at
        if (now - created).total_seconds() < 600:
            return _out(r)

    year = now.year
    count = (await db.execute(select(func.count(Enquiry.id)))).scalar() or 0
    reference = f"TFC-{year}-{count + 1:06d}"

    enquiry = Enquiry(
        reference_number=reference, type=etype, status=EnquiryStatus.NEW,
        customer_name=body.customer_name.strip(), phone=phone, email=email,
        preferred_contact_time=(body.preferred_contact_time or None),
        origin=(body.origin or None), destination=(body.destination or None),
        travel_start_date=body.travel_start_date, travel_end_date=body.travel_end_date,
        traveller_count=body.traveller_count, budget=body.budget,
        service_details=json.dumps(body.service_details or {}),
        selected_option=json.dumps(body.selected_option) if body.selected_option else None,
        special_requirements=(body.special_requirements or None), source=body.source,
        trip_snapshot=json.dumps(body.trip_snapshot) if body.trip_snapshot else None,
        idempotency_key=body.idempotency_key,
    )
    db.add(enquiry)
    await db.flush()
    db.add(EnquiryStatusHistory(enquiry_id=enquiry.id, status=EnquiryStatus.NEW, changed_by="system", comment="Request received"))
    await db.commit()
    await db.refresh(enquiry)

    await notify_admin_new_enquiry(reference, etype.value, body.destination or "—")
    if email:
        await send_customer_confirmation(email, reference, etype.value)
    return _out(enquiry)


@router.get("/{reference}", response_model=EnquiryOut)
async def lookup_enquiry(reference: str, phone: str, db: AsyncSession = Depends(get_db)):
    """Status lookup gated by phone — never expose enquiries by bare sequential ID."""
    try:
        normalized = normalize_phone(phone)
    except ValueError:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit Indian mobile number.")
    enquiry = (
        await db.execute(select(Enquiry).where(Enquiry.reference_number == reference.strip().upper()))
    ).scalar_one_or_none()
    if enquiry is None or enquiry.phone != normalized:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return _out(enquiry)
