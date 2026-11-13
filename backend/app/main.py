"""
HealthBridge AI — FastAPI Backend
Entry point: uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base

# Import all models so SQLAlchemy registers them before create_all()
import app.models  # noqa: F401

from app.routers import auth, journal, appointments, wellness, medicine, healthcare

# ── Create all database tables on startup ────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App instance ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="HealthBridge AI API",
    description=(
        "Backend API for HealthBridge AI — a demo healthcare accessibility application.\n\n"
        "**⚠ Demo Application:** No real healthcare data is used. Not for medical decisions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(appointments.router)
app.include_router(wellness.router)
app.include_router(medicine.router)
app.include_router(healthcare.router)

# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "environment": settings.APP_ENV,
        "docs": "/docs",
        "disclaimer": "Demo application — not for medical use",
    }


@app.get("/health", tags=["health"])
def health():
    return JSONResponse({"status": "ok"})
