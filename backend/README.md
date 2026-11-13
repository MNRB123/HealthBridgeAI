# HealthBridge AI — Backend API

FastAPI backend for the HealthBridge AI demo application.

> ⚠️ **Demo Application** — Not for real medical use. No real healthcare data.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.115 |
| Language | Python 3.12 |
| Database | SQLite (dev) via SQLAlchemy 2.0 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI | OpenAI GPT-4o |
| Container | Docker + docker-compose |

---

## Quick Start (Docker)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 2. Set your OpenAI API key
Edit `d:\HealthBridgeAI\.env`:
```
OPENAI_API_KEY=sk-your-real-key-here
```
Get a key at https://platform.openai.com/api-keys

> Without a key, the wellness chat returns a friendly fallback message — all other features work normally.

### 3. Build and start the backend
```powershell
cd d:\HealthBridgeAI
docker compose up --build
```

The API starts at **http://localhost:8000**

### 4. Start the frontend (separate terminal)
```powershell
cd d:\HealthBridgeAI
npm run dev
```

Frontend at **http://localhost:5173**

---

## API Documentation

Once the backend is running, open:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | App info & status | No |
| GET | `/health` | Health check | No |
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login → JWT token | No |
| GET | `/api/auth/me` | Current user profile | ✅ |
| GET | `/api/journal/` | List journal entries | ✅ |
| POST | `/api/journal/` | Create journal entry | ✅ |
| DELETE | `/api/journal/{id}` | Delete entry | ✅ |
| GET | `/api/journal/mood-summary` | Mood stats | ✅ |
| GET | `/api/appointments/` | List appointments | ✅ |
| POST | `/api/appointments/` | Create appointment | ✅ |
| PATCH | `/api/appointments/{id}` | Update appointment | ✅ |
| DELETE | `/api/appointments/{id}` | Delete appointment | ✅ |
| POST | `/api/wellness/sessions` | Start chat session | ✅ |
| GET | `/api/wellness/sessions` | List sessions | ✅ |
| POST | `/api/wellness/chat` | Send message → AI reply | ✅ |
| GET | `/api/medicine/search` | Medicine price search | No |
| GET | `/api/healthcare/search` | Provider search | No |

---

## AI Safety Controls

The Mental Wellness AI endpoint includes:
1. **Crisis keyword detection** — matches patterns like "suicid*", "hurt myself", "want to die"
2. **Immediate 988 referral** — crisis messages bypass GPT and return a 988 Lifeline referral
3. **Crisis flag stored** — `is_crisis_flagged=True` saved in DB for every crisis message
4. **System prompt enforcement** — GPT instructed never to diagnose or prescribe
5. **Token limit** — max 300 output tokens per response to control cost
6. **Context window limit** — only last 10 messages sent to API

---

## Useful Docker Commands

```powershell
# Build and start
docker compose up --build

# Start in background
docker compose up --build -d

# View logs
docker compose logs -f backend

# Stop
docker compose down

# Open shell inside container
docker compose exec backend /bin/sh

# Reset database (delete the volume)
docker compose down -v
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | (generated) | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 60 | Token lifetime |
| `DATABASE_URL` | `sqlite:///./data/healthbridge.db` | DB connection string |
| `OPENAI_API_KEY` | — | Your OpenAI key |
| `OPENAI_MODEL` | `gpt-4o` | Model to use |
| `CORS_ORIGINS` | localhost:5173 | Allowed frontend origins |
| `DEBUG` | `true` | SQLAlchemy query logging |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── core/
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── security.py      # JWT + bcrypt
│   │   └── deps.py          # Auth dependency injection
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── journal.py
│   │   ├── appointment.py
│   │   └── chat.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── journal.py
│   │   ├── appointment.py
│   │   └── chat.py
│   ├── routers/             # API route handlers
│   │   ├── auth.py
│   │   ├── journal.py
│   │   ├── appointments.py
│   │   ├── wellness.py
│   │   ├── medicine.py
│   │   └── healthcare.py
│   └── services/
│       └── ai_service.py    # OpenAI GPT-4o + crisis detection
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```
