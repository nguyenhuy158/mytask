# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`mytask` is a terminal-native marketing system and TUI-inspired dashboard for Odoo task management. It integrates with Odoo over XML-RPC and runs scheduled/automated workflows (crons, webhooks, backups). The visual identity is a manpage/README aesthetic — Berkeley Mono everywhere, cream/ink palette, ASCII markers (`[+]`, `[-]`, `[x]`), 4px corners.

- **Backend:** FastAPI + Pydantic v2, Prisma (SQLite), APScheduler, slowapi, websockets, boto3.
- **Frontend:** React 18 + Vite + TypeScript, Tailwind CSS, Shadcn UI (Radix), TanStack Query v5, Zustand, Recharts.
- **Deployment:** Docker Compose behind Nginx at `task.local` (backend `:8000`, frontend `:3000` in dev / `:5173` in container).

## Commands

All workflows are driven through the root `Makefile`.

- **Setup:** `make setup-dev` (creates backend venv via `uv`, installs frontend deps via `pnpm`, seeds `backend/.env` from `.env.example`).
- **Local dev (both):** `make dev-local` (runs backend and frontend in parallel).
- **Backend only:** `make dev-backend` (uvicorn `app.main:app --reload --port 8000`).
- **Frontend only:** `make dev-frontend` (Vite on port 3000).
- **Docker:** `make up | down | restart | build | logs | ps | clean`.
- **Host setup:** `make setup-host` prints the command to add `task.local` to `/etc/hosts`.

### Quality gates

- **Lint:** `make lint` — Ruff (backend), `tsc` type-check + ESLint (frontend).
- **Format:** `make format` — Ruff (backend), Prettier (frontend).
- **Test all:** `make test` — backend pytest + frontend Vitest + Playwright E2E.
- **Test subsets:** `make test-backend`, `make test-frontend`, `make test-e2e`.
- **Coverage reports:** `make cov-backend`, `make cov-frontend`, `make cov` (opens HTML reports).

### Running single tests

- Backend single test: `cd backend && PYTHONPATH=. uv run pytest tests/test_task_service.py::test_name -vv`.
- Frontend single test: `cd frontend && pnpm exec vitest run path/to/file.test.tsx -t "test name"`.
- Single E2E spec: `cd frontend && pnpm exec playwright test e2e/tasks.spec.ts`.

### Database (Prisma)

After any change to `backend/schema.prisma`:
```
cd backend && uv run prisma db push --accept-data-loss && uv run prisma generate
```
If Prisma client imports fail at runtime/tests, re-run `prisma generate`. The backend container's `start.sh` runs both on boot.

### Pre-commit / Husky

- `.husky/pre-commit` runs `lint-staged` (Ruff on Python, ESLint + Prettier on frontend), then `make test-backend` and `make test-frontend` (E2E intentionally skipped).
- `.pre-commit-config.yaml` mirrors the same gates for `pre-commit` users. Do not bypass with `--no-verify`.

## Architecture

### Backend — Hexagonal (Ports & Adapters)

Entry point `backend/app/main.py` wires adapters into services inside an async `lifespan`:

- **`app/core/`** — pure domain.
  - `entities/models.py`: Pydantic schemas.
  - `ports/`: `repository.py` and `external_services.py` define the interfaces the services depend on.
  - `services/`: `task_service.py`, `odoo_service.py`, `backup_service.py` — the business logic. They receive port instances by DI; never import adapters directly.
  - `constants.py`, `i18n.py` + `i18n/`: response codes + translator.
- **`app/adapters/driven/`** — outbound implementations: `prisma_adapter.py` (repository), `odoo_adapter.py` (XML-RPC), `http_adapter.py` (external HTTP + notifications), `s3_adapter.py` (boto3), `database.py` (Prisma connect/disconnect).
- **`app/adapters/driving/`** — inbound entry points: `api_adapter.py` (FastAPI router, mounted under `/`), `websocket_adapter.py` (broadcast hub used by services), `scheduler_adapter.py` (APScheduler — schedules cron tasks and backups on startup), `rpc_adapter.py` (external XML-RPC surface at `/rpc`).

On startup the scheduler reads `TaskConfig`s with a `cron_expression` and registers each one; it also schedules the backup cron from `SystemConfig`. `WebSocketAdapter` is injected into `TaskService` as the `broadcast` port so completions push live updates.

Rate limiting via `slowapi` is wired on `app.state.limiter` (10/min create, 5/min run — see `api_adapter.py`).

### Frontend — Clean Architecture

`frontend/src/` layers:

- **`domain/`** — pure logic. `models/` (TS types: `Task`, `Cron`, `OdooEnv`, `Webhook`, `S3`, `System`, `OAuthProvider`), `services/` (`TaskService`, `CronService`), `store/` (Zustand: `useAppStore`, `useUserStore`).
- **`ports/`** — interfaces consumed by `ui` and implemented by `adapters`: `ITaskRepository`, `IOdooRepository`, `ISystemRepository`, `IWsAdapter`.
- **`adapters/`** — `api/` (Axios + TanStack Query repos), `websocket/` (WS client), `taskHooks.ts` (query/mutation hooks).
- **`ui/`** — `components/` (dumb/Shadcn-style, including `components/ui/` Shadcn primitives), `features/` (smart, screen-level: `Dashboard`, `CalendarView`, `TaskCard`, `PomodoroTimer`, `S3Explorer`, `OdooShell`, `CommandPalette`, `HealthDashboard`, etc.), `hooks/`, `layouts/`.

Vite config exposes `@/` → `src/`. Dev server proxies `/api/*` → `http://localhost:8000` (Nginx does the same in containers, and also upgrades `/api/ws` to the backend `/ws` WebSocket).

### Data model (Prisma, SQLite)

Defined in `backend/schema.prisma`. Core entities: `TaskConfig` (with `TaskHistory`, `Note`, `FileAttachment`), `OdooEnv`, `WebhookConfig`, `NotificationConfig`, `AuditLog`, `SystemConfig`, `S3Config`. Cascade deletes are set on `TaskHistory`/`FileAttachment`.

## Conventions (non-negotiable)

- **No comments.** Code must be self-documenting via descriptive names. Do not add `#` or `//` explanations.
- **No single-letter variables.** `index`, `task_id`, `record` — not `i`, `t`, `r`.
- **DRY.** Extract shared logic; do not copy-paste.
- **Modern tooling only.** `uv` for Python, `pnpm` for Node. Do not introduce pip/npm/yarn.
- **Imports:** frontend uses `@/...`; backend `core/` uses relative imports (`from . import ...`).
- **Typography:** Berkeley Mono only. No sans-serif anywhere. Font stack lives in `tailwind.config.js` (`font-mono`).
- **Aesthetic:** cream `#fdfcfc` canvas, ink `#201d1d`, 4px radius (`rounded-sm`/`--radius`), 1px hairline borders, ASCII markers. Tailwind colors and radius are locked in `tailwind.config.js` and CSS vars — do not override with hex.
- **No `alert()`.** User feedback uses `react-hot-toast`.
- **Charts:** use `ChartContainer` from `@/ui/components/ui/chart.tsx`, wired to the HSL CSS variables — not raw Recharts colors.
- **Coverage:** project rule is 100% mandatory; tool configs (`pyproject.toml` `fail_under = 80`, `vite.config.ts` thresholds `80`) are the enforced floor — keep both green and do not lower them.
- **FastAPI:** use `Annotated[..., Depends(...)]` for DI; `B008` is intentionally ignored in Ruff so `Depends()` in defaults is fine.

## Reference docs in repo

- `design.md` — the canonical color/typography/spacing system (read before any styling change).
- `AGENTS.md`, `RTK.md` — agent-facing notes on tech stack, constraints, and domain language; this file is the source of truth and supersedes any drift between them.
- `websocket_plan.md` — original WS rollout plan; current implementation lives in `websocket_adapter.py` and the frontend `adapters/websocket/`.
- `FEATURES_CHECKLIST.md` — feature inventory (all items currently checked off).
- `frontend/README.md` — stock Vite template README; safe to ignore.

## Pitfalls

- **Prisma client missing:** run `uv run prisma generate` in `backend/` (also required after pulling schema changes).
- **WebSocket through Nginx:** `/api/ws` is rewritten to backend `/ws` with `Upgrade` headers — keep this in sync if you rename endpoints.
- **Playwright webServer:** `playwright.config.ts` boots its own backend against `file:./test.db`; don't point E2E at the dev DB.
- **Backend tests need `PYTHONPATH=.`** (set by `make test-backend`); calling `pytest` directly from `backend/` without it will fail to import `app`.
