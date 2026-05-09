# mytask | Agent Instructions

## Tech Stack
- **Backend:** FastAPI, Pydantic v2, Prisma, APScheduler, Ruff.
- **Frontend:** React, TanStack Query v5, Zustand, Tailwind CSS, Shadcn UI, Recharts.

## Critical Constraints
- **100% COVERAGE:** Mandatory for both FE and BE. Commits WILL fail if < 100%.
- **TEST PURITY:** Zero warnings/errors in console. Mock `localStorage`, `URL`, `i18n` in FE.
- **TYPOGRAPHY:** Berkeley Mono ONLY. No other fonts allowed.
- **AESTHETIC:** High-contrast cream (`#fdfcfc`) / ink (`#201d1d`). 4px corners. ASCII markers `[+]`, `[-]`, `[x]`.
- **NO COMMENTS:** Code must be self-documenting. No `#` or `//` explanations.
- **NO ALERTS:** Use `toast` (react-hot-toast).

## Commands & Workflows
- **Verify:** `make lint && make format && make test` (Run before EVERY commit).
- **Test:** `make test-backend`, `make test-frontend`. `make cov` to view reports.
- **DB:** `cd backend && uv run prisma db push --accept-data-loss && uv run prisma generate`.
- **Frontend UI:** Shadcn UI components installed: `tooltip`, `popover`, `dialog`, `dropdown-menu`, `form`, `table`, `label`, `chart`. Use `npx shadcn@latest add <component>` for new ones.
- **Port:** Backend :8000, Frontend :3000 (via `make dev-local`).

## Architecture & Conventions
- **Backend (Hexagonal):**
    - `app/core/`: Domain models and business logic. Use relative imports (`from . import`).
    - `app/adapters/`: `driven/` (Prisma, S3, Odoo) and `driving/` (FastAPI, WS).
- **Frontend (Clean):**
    - `src/domain/`: Pure logic & Zustand stores.
    - `src/ports/`: Interfaces/Types.
    - `src/adapters/`: API (TanStack Query) & Storage.
    - `src/ui/`: `features/` (smart) and `components/` (dumb/Shadcn).
- **Paths:** Always use `@/` alias in frontend (e.g., `@/lib/utils`, `@/ui/components`).
- **Charts:** Use `ChartContainer` from `@/ui/components/ui/chart.tsx`. Wire to HSL variables.

## Common Pitfalls
- **Prisma:** If imports fail, run `prisma generate` in `backend/`.
- **Tailwind:** Colors and 4px radius are locked in `tailwind.config.js`. Do not override with hex codes.
- **Pre-commit:** Enforces 100% coverage. Use `pytest -vv` to debug BE test failures.
