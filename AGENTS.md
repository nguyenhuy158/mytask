# mytask | Agent Instructions

## Critical Constraints
- **NO COMMENTS:** Never add `#` or `//` explanations. Code must be self-documenting.
- **TYPOGRAPHY:** Berkeley Mono ONLY. No sans-serif or serif fonts allowed anywhere.
- **AESTHETIC:** Follow `design.md` strictly. High-contrast, cream/ink, monospace, 4px corners.

## Commands & Workflows
- **Start All:** `make dev-local` (runs backend:8000, frontend:3000).
- **DB Changes:**
    1. Edit `backend/schema.prisma`.
    2. Run `cd backend && uv run prisma db push --accept-data-loss`.
    3. Run `cd backend && uv run prisma generate`.
- **Lint/Format:** `make lint` and `make format`.

## Architecture
- **Backend (Hexagonal):**
    - `app/core/`: Domain models and business logic services.
    - `app/adapters/driven/`: Database (Prisma), Odoo (XML-RPC), S3 implementations.
    - `app/adapters/driving/`: FastApi endpoints, Scheduler, WebSockets.
- **Frontend (Clean):**
    - `src/domain/`: Pure logic and models.
    - `src/ports/`: Interfaces (TypeScript types/interfaces).
    - `src/adapters/`: API (Axios), Storage, WebSocket implementations.
    - `src/ui/`: Features (smart) and Components (dumb).

## Domain Specifics
- **Odoo:** Managed via `backend/app/rpc.py` and `OdooAdapter`.
- **Tasks:** Central entity. Track `cron_expression` for scheduling.
- **Audit Logs:** Use `prisma_adapter.add_audit_log` for any system-level action.

## Common Pitfalls
- **Prisma Client:** If you get "module 'prisma' has no attribute 'Prisma'", run `prisma generate` in `backend/`.
- **Imports:** Backend uses relative imports (e.g., `from ...core...`). Maintain this style.
- **Tailwind:** Custom colors are mapped in `frontend/tailwind.config.js` from `design.md`.
