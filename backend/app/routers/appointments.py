"""Appointments endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(
    status_filter: str = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the user's appointments."""
    q = db.query(Appointment).filter(Appointment.user_id == current_user.id)
    if status_filter != "all":
        q = q.filter(Appointment.status == status_filter)
    return q.order_by(Appointment.appointment_date.asc()).all()


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new appointment."""
    appt = Appointment(
        user_id=current_user.id,
        title=payload.title,
        provider_name=payload.provider_name or "",
        provider_type=payload.provider_type or "",
        location=payload.location or "",
        appointment_date=payload.appointment_date,
        duration_minutes=payload.duration_minutes or 30,
        notes=payload.notes or "",
        is_telehealth=payload.is_telehealth or False,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.get("/{appt_id}", response_model=AppointmentResponse)
def get_appointment(
    appt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.user_id == current_user.id,
    ).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appt


@router.patch("/{appt_id}", response_model=AppointmentResponse)
def update_appointment(
    appt_id: int,
    payload: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.user_id == current_user.id,
    ).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.user_id == current_user.id,
    ).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    db.delete(appt)
    db.commit()
