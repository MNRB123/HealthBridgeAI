"""
Healthcare provider search endpoint.
Phase 5: Returns demo/stub data structured for real API integration.
Phase 6 (future): Wire to HRSA API or similar.
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/healthcare", tags=["healthcare"])


class Provider(BaseModel):
    name: str
    type: str
    address: str
    distance_miles: Optional[float]
    phone: str
    hours: str
    accepting_new: bool
    budget: str
    rating: float
    specialties: List[str]
    telehealth: bool


class HealthcareSearchResponse(BaseModel):
    zip_code: str
    radius_miles: int
    results: List[Provider]
    data_source: str = "demo"
    disclaimer: str


DEMO_PROVIDERS = [
    Provider(name="Riverside Community Health Center", type="community", address="245 Main St, Demo City, NY 10001", distance_miles=0.4, phone="(555) 100-0001", hours="Mon–Fri 8am–6pm", accepting_new=True, budget="sliding_scale", rating=4.6, specialties=["Primary Care", "Pediatrics"], telehealth=True),
    Provider(name="Hope Free Clinic", type="clinic", address="88 Oak Ave, Demo City, NY 10002", distance_miles=0.9, phone="(555) 100-0002", hours="Tue & Thu 5pm–9pm", accepting_new=True, budget="free", rating=4.9, specialties=["Primary Care", "Mental Health"], telehealth=False),
    Provider(name="Metro Urgent Care", type="urgent", address="500 Broadway, Demo City, NY 10003", distance_miles=1.2, phone="(555) 100-0003", hours="Daily 8am–10pm", accepting_new=True, budget="under_50", rating=4.1, specialties=["Urgent Care", "X-Ray"], telehealth=True),
    Provider(name="Wellspring Mental Health Center", type="mental", address="300 Elm St, Demo City, NY 10005", distance_miles=2.0, phone="(555) 100-0005", hours="Mon–Fri 9am–7pm", accepting_new=True, budget="sliding_scale", rating=4.7, specialties=["Therapy", "Psychiatry"], telehealth=True),
]


@router.get("/search", response_model=HealthcareSearchResponse)
def search_providers(
    zip_code: str = Query(..., min_length=5, max_length=5, description="ZIP code"),
    radius_miles: int = Query(5, ge=1, le=25, description="Search radius"),
    budget: str = Query("all", description="Budget filter: all|free|sliding_scale|under_25|under_50"),
    specialty: str = Query("all", description="Specialty filter"),
):
    """
    Search for healthcare providers.
    Currently returns demo data. In Phase 6 this will call the HRSA API or similar.
    """
    return HealthcareSearchResponse(
        zip_code=zip_code,
        radius_miles=radius_miles,
        results=DEMO_PROVIDERS,
        data_source="demo",
        disclaimer=(
            "DEMO DATA ONLY. These are not real healthcare providers. "
            "Do not make healthcare decisions based on this data."
        ),
    )
