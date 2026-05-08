.PHONY: up down restart build logs ps clean help setup-host setup-dev dev-backend dev-frontend dev-local lint format test test-backend test-frontend test-e2e cov-backend cov-frontend cov

help:
	@echo "Available commands:"
	@echo "  make up           - Start all services in detached mode (Docker)"
	@echo "  make down         - Stop and remove all services (Docker)"
	@echo "  make restart      - Restart all services (Docker)"
	@echo "  make build        - Rebuild and start services (Docker)"
	@echo "  make logs         - View real-time logs (Docker)"
	@echo "  make ps           - List running services (Docker)"
	@echo "  make clean        - Remove all containers, networks, and volumes"
	@echo "  make setup-host   - Instructions to setup task.local"
	@echo "  make setup-dev    - Setup local development environment (no Docker)"
	@echo "  make dev-backend  - Run backend locally"
	@echo "  make dev-frontend - Run frontend locally"
	@echo "  make dev-local    - Run both backend and frontend locally"
	@echo "  make lint         - Run linting for both backend and frontend"
	@echo "  make format       - Run formatting for both backend and frontend"
	@echo "  make test         - Run all tests (backend, frontend unit, e2e)"
	@echo "  make test-backend - Run backend tests"
	@echo "  make test-frontend - Run frontend unit tests"
	@echo "  make test-e2e     - Run E2E tests (requires services to be running)"
	@echo "  make cov-backend  - Open backend coverage report"
	@echo "  make cov-frontend - Open frontend coverage report"
	@echo "  make cov          - Open both coverage reports"

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

build:
	docker-compose up -d --build

logs:
	docker-compose logs -f

ps:
	docker-compose ps

clean:
	docker-compose down --v --rmi all --remove-orphans

setup-host:
	@echo "Run this command to add task.local to your hosts file:"
	@echo "sudo sh -c 'echo \"127.0.0.1 task.local\" >> /etc/hosts'"

setup-dev:
	@echo "Setting up backend..."
	cd backend && uv venv && . .venv/bin/activate && uv pip install -r requirements.txt
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "Created backend/.env from .env.example. Please update it with your Odoo credentials."; \
	fi
	@echo "Setting up frontend..."
	cd frontend && pnpm install

dev-backend:
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && pnpm dev --port 3000

dev-local:
	@echo "Starting backend and frontend..."
	@make -j 2 dev-backend dev-frontend

lint:
	@echo "Linting backend..."
	cd backend && uv run ruff check .
	@echo "Type-checking frontend..."
	cd frontend && pnpm type-check
	@echo "Linting frontend..."
	cd frontend && pnpm lint

format:
	@echo "Formatting backend..."
	cd backend && uv run ruff format .
	@echo "Formatting frontend..."
	cd frontend && pnpm format

test-backend:
	@echo "Running backend tests..."
	cd backend && PYTHONPATH=. uv run pytest

test-frontend:
	@echo "Running frontend unit tests..."
	cd frontend && pnpm test

test-e2e:
	@echo "Running E2E tests..."
	cd frontend && pnpm test:e2e

test: test-backend test-frontend test-e2e

cov-backend:
	open backend/htmlcov/index.html

cov-frontend:
	open frontend/coverage/index.html

cov: cov-backend cov-frontend
