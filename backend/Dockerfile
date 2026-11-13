# ─── Stage 1: dependency builder ─────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# System deps needed to compile some packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps into a prefix folder (keeps final image clean)
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt


# ─── Stage 2: final runtime image ────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Labels
LABEL maintainer="HealthBridge AI Demo"
LABEL description="HealthBridge AI FastAPI backend — demo application"

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source
COPY ./app ./app

# Create a non-root user for security
RUN useradd --no-create-home --shell /bin/false appuser \
    && mkdir -p /app/data \
    && chown -R appuser:appuser /app

USER appuser

# SQLite database lives in /app/data (mount a volume here in production)
ENV DATABASE_URL=sqlite:///./data/healthbridge.db

EXPOSE 8000

# Health check — calls the /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
