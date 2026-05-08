# Project Rules: mytask

## Project Overview
Marketing system and TUI-inspired dashboard for Odoo task management.
- **Backend:** FastAPI, APScheduler, XML-RPC (Odoo integration).
- **Frontend:** React (Vite), Tailwind CSS, Berkeley Mono typography.
- **Deployment:** Docker Compose, Nginx (task.local).

## Commands
- **Local Dev:** `make dev-local` (both), `make dev-backend`, `make dev-frontend`.
- **Quality:** `make lint && make format && make test`.
- **Coverage:** `make cov` (Mandatory 100% threshold).
- **Setup:** `make setup-dev`, `make setup-host`.
- **Backend Run:** `cd backend && uv run uvicorn app.main:app --reload`
- **Frontend Run:** `cd frontend && pnpm dev --port 3000`

## Coding Standards
- **Coverage:** 100% mandatory for both FE and BE.
- **No Comments:** Code must be clean and self-documenting. No `#` or `//` for explanations.
- **Self-Documenting:** Use descriptive names for functions and variables.
- **No Duplication:** Follow DRY principles. Extract reusable logic.
- **No Single-Letter Variables:** Use `index` instead of `i`, `task_id` instead of `t`.
- **Modern Tools:** Use `uv` for Python and `pnpm` for Node.
- **Imports:** Use `@/` for frontend imports and relative imports for backend core.

## Backend Guidelines
- **Structure:** `app/main.py` (entry), `app/core/` (logic), `app/adapters/` (external systems).
- **Style:** Ruff for linting/formatting.
- **FastAPI:** Use `Annotated` and `Depends` for DI.

## Frontend Guidelines
- **Structure:** Clean Architecture - `domain/` (logic), `ports/` (interfaces), `adapters/` (impl), `ui/` (React).
- **Styling:** Tailwind CSS with custom theme from `design.md`. Berkeley Mono for all text.
- **Components:** Atomic design in `ui/components` and `ui/features`.
