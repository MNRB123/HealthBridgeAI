"""Appointment schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class AppointmentCreate(BaseModel):
    title: str
    provider_name: Optional[str] = ""
    provider_type: Optional[str] = ""
    location: Optional[str] = ""
    appointment_date: datetime
    duration_minutes: Optional[int] = 30
    notes: Optional[str] = ""
    is_telehealth: Optional[bool] = False

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()


class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    provider_name: Optional[str] = None
    provider_type: Optional[str] = None
    location: Optional[str] = None
    appointment_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    is_telehealth: Optional[bool] = None
    status: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    title: str
    provider_name: str
    provider_type: str
    location: str
    appointment_date: datetime
    duration_minutes: int
    notes: str
    is_telehealth: bool
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
