# mytask | Agent Instructions

## Tech Stack
- **Backend:** FastAPI, Pydantic v2, Prisma, APScheduler.
- **Frontend:** React, TanStack Query v5, Zustand, Tailwind CSS, Shadcn UI.

## Critical Constraints
- **NO COMMENTS:** Never add `#` or `//` explanations. Code must be self-documenting.
- **TYPOGRAPHY:** Berkeley Mono ONLY. No sans-serif or serif fonts allowed anywhere.
- **AESTHETIC:** Follow `design.md` strictly. High-contrast, cream/ink, monospace, 4px corners.

## Commands & Workflows
- **Start All:** `make dev-local` (backend:8000, frontend:5173).
- **DB Changes:** `cd backend && uv run prisma db push --accept-data-loss && uv run prisma generate`.
- **Frontend UI:** Use `npx shadcn-ui@latest add <component>` in `frontend/`.
- **Lint/Format:** `make lint` and `make format`.

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

## Domain Specifics
- **Odoo:** Managed via `backend/app/rpc.py` and `OdooAdapter`.
- **Tasks:** Central entity. Track `cron_expression` for scheduling.
- **Audit Logs:** Use `prisma_adapter.add_audit_log` for any system-level action.

## Common Pitfalls
- **Prisma Client:** Run `prisma generate` in `backend/` if imports fail.
- **Imports:** Backend uses relative imports (e.g., `from ...core...`).
- **Tailwind:** Colors and 4px radius are strictly defined in `tailwind.config.js`.
