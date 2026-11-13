"""Chat schemas."""
from datetime import datetime
from typing import List
from pydantic import BaseModel, field_validator


class ChatMessageRequest(BaseModel):
    message: str
    session_id: int

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        if len(v) > 2000:
            raise ValueError("Message too long (max 2000 characters)")
        return v


class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    is_crisis_flagged: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionCreate(BaseModel):
    title: str = "Wellness Check-in"


class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    is_active: bool
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    model_config = {"from_attributes": True}
