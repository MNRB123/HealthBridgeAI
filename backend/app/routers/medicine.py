"""
Medicine price search endpoint.
Phase 5: Returns demo/stub data structured for real API integration.
Future: wire to RxNorm plus a licensed pharmacy price API.
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/medicine", tags=["medicine"])


class PharmacyPrice(BaseModel):
    pharmacy: str
    type: str
    distance_miles: Optional[float]
    brand_price: float
    generic_price: Optional[float]
    coupon_available: bool
    in_stock: bool
    rating: float


class MedicineSearchResponse(BaseModel):
    drug_name: str
    dosage: str
    quantity: int
    zip_code: str
    results: List[PharmacyPrice]
    data_source: str = "demo"
    disclaimer: str


DEMO_PRICES = [
    PharmacyPrice(pharmacy="Demo Pharmacy One", type="chain", distance_miles=0.4, brand_price=24.99, generic_price=8.49, coupon_available=True, in_stock=True, rating=4.2),
    PharmacyPrice(pharmacy="Demo Pharmacy Two", type="chain", distance_miles=0.7, brand_price=27.49, generic_price=9.99, coupon_available=True, in_stock=True, rating=4.0),
    PharmacyPrice(pharmacy="Demo Pharmacy Three", type="chain", distance_miles=1.2, brand_price=11.98, generic_price=4.00, coupon_available=False, in_stock=True, rating=3.8),
    PharmacyPrice(pharmacy="Demo Pharmacy Four", type="chain", distance_miles=2.1, brand_price=9.89, generic_price=3.49, coupon_available=False, in_stock=True, rating=4.6),
    PharmacyPrice(pharmacy="Independent Pharmacy", type="independent", distance_miles=0.9, brand_price=18.75, generic_price=7.25, coupon_available=True, in_stock=True, rating=4.8),
    PharmacyPrice(pharmacy="Demo Mail-Order Pharmacy", type="online", distance_miles=None, brand_price=7.20, generic_price=3.00, coupon_available=True, in_stock=True, rating=4.4),
]


@router.get("/search", response_model=MedicineSearchResponse)
def search_prices(
    drug_name: str = Query(..., min_length=2, description="Medication name"),
    dosage: str = Query("10mg", description="Dosage strength"),
    quantity: int = Query(30, ge=1, le=360, description="Number of pills"),
    zip_code: str = Query("00000", description="ZIP code for local search"),
):
    """
    Search for medicine prices.
    Currently returns demo data. In Phase 6 this will call a real pharmacy API.
    """
    return MedicineSearchResponse(
        drug_name=drug_name,
        dosage=dosage,
        quantity=quantity,
        zip_code=zip_code,
        results=DEMO_PRICES,
        data_source="demo",
        disclaimer=(
            "DEMO DATA ONLY. These are not real pharmacy prices. "
            "Do not make healthcare decisions based on this data."
        ),
    )
