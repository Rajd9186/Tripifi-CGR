from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import User, WishlistItem
from app.routers.deps import get_current_user
from app.schemas.schemas import WishlistAdd

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("")
async def list_wishlist(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (await db.execute(select(WishlistItem).where(WishlistItem.user_id == user.id))).scalars().all()
    return [{"id": str(r.id), "item_type": r.item_type, "item_id": r.item_id} for r in rows]


@router.post("", status_code=201)
async def add_wishlist(body: WishlistAdd, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    existing = (
        await db.execute(
            select(WishlistItem).where(
                WishlistItem.user_id == user.id,
                WishlistItem.item_type == body.item_type,
                WishlistItem.item_id == body.item_id,
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        return {"id": str(existing.id), "duplicate": True}
    row = WishlistItem(user_id=user.id, item_type=body.item_type, item_id=body.item_id)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return {"id": str(row.id), "duplicate": False}


@router.delete("/{item_id}", status_code=204)
async def remove_wishlist(item_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    from uuid import UUID

    try:
        uid = UUID(item_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid id")
    row = (
        await db.execute(select(WishlistItem).where(WishlistItem.id == uid, WishlistItem.user_id == user.id))
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(row)
    await db.commit()
    return None
