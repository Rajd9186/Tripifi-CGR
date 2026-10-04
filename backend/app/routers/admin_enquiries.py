"""Admin enquiry workflow. Requires ADMIN or TRAVEL_AGENT role."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Enquiry, EnquiryNote, EnquiryStatus, EnquiryStatusHistory, User
from app.routers.deps import require_role
from app.schemas.schemas import EnquiryAssign, EnquiryDetailOut, EnquiryNoteAdd, EnquiryStatusUpdate

router = APIRouter(prefix="/admin/enquiries", tags=["admin-enquiries"])
admin_only = require_role("ADMIN", "TRAVEL_AGENT")


def _detail(e: Enquiry) -> EnquiryDetailOut:
    import json

    def parse(raw: str | None):
        try:
            return json.loads(raw) if raw else {}
        except Exception:
            return {}

    return EnquiryDetailOut(
        id=str(e.id), reference_number=e.reference_number, type=e.type.value,
        status=e.status.value, customer_name=e.customer_name, origin=e.origin,
        destination=e.destination, travel_start_date=e.travel_start_date,
        travel_end_date=e.travel_end_date, traveller_count=e.traveller_count,
        created_at=e.created_at, email=e.email, phone=e.phone, budget=e.budget,
        service_details=parse(e.service_details), selected_option=parse(e.selected_option),
        special_requirements=e.special_requirements, source=e.source,
        assigned_to=e.assigned_to, updated_at=e.updated_at,
    )


@router.get("")
async def list_enquiries(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(admin_only),
):
    q = select(Enquiry).order_by(desc(Enquiry.created_at)).limit(100)
    if status:
        try:
            q = q.where(Enquiry.status == EnquiryStatus(status))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    rows = (await db.execute(q)).scalars().all()
    return [_detail(r) for r in rows]


@router.get("/{enquiry_id}", response_model=EnquiryDetailOut)
async def get_enquiry(enquiry_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(admin_only)):
    row = (await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return _detail(row)


@router.patch("/{enquiry_id}", response_model=EnquiryDetailOut)
async def update_status(
    enquiry_id: UUID, body: EnquiryStatusUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(admin_only)
):
    row = (await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    try:
        new_status = EnquiryStatus(body.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    row.status = new_status
    db.add(
        EnquiryStatusHistory(
            enquiry_id=row.id, status=new_status,
            changed_by=body.changed_by or user.email, comment=body.comment,
        )
    )
    await db.commit()
    await db.refresh(row)
    return _detail(row)


@router.post("/{enquiry_id}/notes", status_code=201)
async def add_note(enquiry_id: UUID, body: EnquiryNoteAdd, db: AsyncSession = Depends(get_db), user: User = Depends(admin_only)):
    row = (await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    db.add(EnquiryNote(enquiry_id=row.id, author=body.author or user.email, note=body.note))
    await db.commit()
    return {"ok": True}


@router.post("/{enquiry_id}/assign")
async def assign(enquiry_id: UUID, body: EnquiryAssign, db: AsyncSession = Depends(get_db), _: User = Depends(admin_only)):
    row = (await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    row.assigned_to = body.assigned_to
    db.add(
        EnquiryStatusHistory(enquiry_id=row.id, status=row.status, changed_by="admin", comment=f"Assigned to {body.assigned_to}")
    )
    await db.commit()
    return {"ok": True, "assigned_to": row.assigned_to}


@router.get("/{enquiry_id}/history")
async def history(enquiry_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(admin_only)):
    rows = (
        await db.execute(
            select(EnquiryStatusHistory).where(EnquiryStatusHistory.enquiry_id == enquiry_id).order_by(EnquiryStatusHistory.created_at)
        )
    ).scalars().all()
    return [
        {"status": h.status.value, "changed_by": h.changed_by, "comment": h.comment, "created_at": h.created_at.isoformat()}
        for h in rows
    ]


@router.get("/{enquiry_id}/notes")
async def notes(enquiry_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(admin_only)):
    """Private notes — admin only, never exposed on customer endpoints."""
    rows = (
        await db.execute(select(EnquiryNote).where(EnquiryNote.enquiry_id == enquiry_id).order_by(EnquiryNote.created_at))
    ).scalars().all()
    return [{"author": n.author, "note": n.note, "created_at": n.created_at.isoformat()} for n in rows]
