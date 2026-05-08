# mytask | Agent Instructions

## Tech Stack
- **Backend:** FastAPI, Pydantic v2, Prisma, APScheduler.
- **Frontend:** React, TanStack Query v5, Zustand, Tailwind CSS, Shadcn UI.

## Critical Constraints
- **80% COVERAGE:** Mandatory for both FE and BE. Commits WILL fail if < 80%.
- **TEST PURITY:** All tests must pass with **ZERO** warnings or errors in console/logs.
- **NO COMMENTS:** Never add `#` or `//` explanations. Code must be self-documenting.
- **NO ALERTS:** Never use `alert()` or `confirm()`. Use `toast` (react-hot-toast).
- **TYPOGRAPHY:** Berkeley Mono ONLY. No sans-serif or serif fonts allowed.
- **AESTHETIC:** Follow `design.md`. High-contrast, cream/ink, monospace, 4px corners.

## Commands & Workflows
- **Test & Coverage:** `make test` (full suite), `make test-backend`, `make test-frontend`.
- **View Coverage:** `make cov` (opens HTML reports for both).
- **Start All:** `make dev-local` (backend:8000, frontend:5173).
- **DB Changes:** `cd backend && uv run prisma db push --accept-data-loss && uv run prisma generate`.
- **Frontend UI:** Use `npx shadcn-ui@latest add <component>` in `frontend/`.
- **Verify:** `make lint` and `make format` before committing.

## Architecture
- **Backend (Hexagonal):**
    - `app/core/`: Domain models and business logic services.
    - `app/adapters/driven/`: Database (Prisma), Odoo (XML-RPC), S3 implementations.
    - `app/adapters/driving/`: FastAPI endpoints, Scheduler, WebSockets.
- **Frontend (Clean):**
    - `src/domain/`: Pure logic, models, and **Zustand stores** (`src/domain/store`).
    - `src/ports/`: Interfaces (TypeScript types/interfaces).
    - `src/adapters/`: API (**TanStack Query**), Storage, WebSocket implementations.
    - `src/ui/`: Features (smart) and Components (dumb/Shadcn).
    - **Path Alias:** Use `@/` to refer to `src/`.

## Common Pitfalls
- **Prisma Client:** Run `prisma generate` in `backend/` if imports fail.
- **Imports:** Backend uses relative imports (e.g., `from ...core...`).
- **Tailwind:** Colors and 4px radius are strictly defined in `tailwind.config.js`.
- **Browser APIs:** Mock `localStorage`, `URL.createObjectURL`, and `i18n` in FE tests.
- **Pre-commit:** Enforces linting and 80% coverage. Do not bypass without extreme reason.
