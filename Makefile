# ─── HealthBridge AI — Makefile ───────────────────────────────────────────────
# Run these from d:\HealthBridgeAI
# Requires: Docker Desktop, Node.js, npm

.PHONY: help build up down logs shell api-test frontend

help:
	@echo ""
	@echo "  HealthBridge AI — Available Commands"
	@echo "  ─────────────────────────────────────"
	@echo "  make build       Build the backend Docker image"
	@echo "  make up          Start the backend in Docker (foreground)"
	@echo "  make up-d        Start the backend in Docker (background)"
	@echo "  make down        Stop and remove containers"
	@echo "  make logs        Follow backend logs"
	@echo "  make shell       Open a shell inside the backend container"
	@echo "  make api-test    Quick API health check"
	@echo "  make frontend    Start the Vite dev server (run separately)"
	@echo ""

build:
	docker compose build

up:
	docker compose up --build

up-d:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f backend

shell:
	docker compose exec backend /bin/sh

api-test:
	curl -s http://localhost:8000/health | python -m json.tool

frontend:
	cd . && npm run dev
