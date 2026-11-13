"""Journal entry schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class JournalEntryCreate(BaseModel):
    mood: int
    note: str
    tags: Optional[str] = ""

    @field_validator("mood")
    @classmethod
    def mood_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Mood must be between 1 and 5")
        return v

    @field_validator("note")
    @classmethod
    def note_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Note cannot be empty")
        return v.strip()


class JournalEntryResponse(BaseModel):
    id: int
    user_id: int
    mood: int
    note: str
    tags: str
    created_at: datetime

    model_config = {"from_attributes": True}
