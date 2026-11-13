"""Mood journal endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.journal import JournalEntry
from app.schemas.journal import JournalEntryCreate, JournalEntryResponse

router = APIRouter(prefix="/api/journal", tags=["journal"])


@router.get("/", response_model=List[JournalEntryResponse])
def list_entries(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the user's journal entries, newest first."""
    return (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    payload: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new journal entry."""
    entry = JournalEntry(
        user_id=current_user.id,
        mood=payload.mood,
        note=payload.note,
        tags=payload.tags or "",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a journal entry (only the owner can delete)."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    db.delete(entry)
    db.commit()


@router.get("/mood-summary")
def mood_summary(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return average mood and entry count for the last N days."""
    from datetime import datetime, timedelta, timezone
    since = datetime.now(timezone.utc) - timedelta(days=days)
    entries = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == current_user.id,
            JournalEntry.created_at >= since,
        )
        .all()
    )
    if not entries:
        return {"average_mood": None, "entry_count": 0, "days": days}
    avg = sum(e.mood for e in entries) / len(entries)
    return {"average_mood": round(avg, 2), "entry_count": len(entries), "days": days}
