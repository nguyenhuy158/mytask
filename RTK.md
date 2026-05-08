# mytask | Agent Knowledge Base

## Project Essence
`mytask` is a specialized marketing and management system designed with a "terminal-native" aesthetic. It integrates deeply with Odoo via XML-RPC to manage tasks and automated workflows (crons, webhooks).

## Design Philosophy (The "Vibe")
- **Typography:** 100% Berkeley Mono. No exceptions.
- **Aesthetic:** High-contrast, austere, manpage/README style.
- **Colors:** Warm cream canvas (`#fdfcfc`), nearly-black ink (`#201d1d`).
- **UI Elements:** 4px rounded corners (`rounded-sm`), 1px hairline borders, ASCII markers (`[+]`, `[-]`, `[x]`).
- **Hero:** A dark TUI mockup that represents the "soul" of the application.

## System Architecture

### Backend (Python/FastAPI)
- **Architecture:** Hexagonal (Ports & Adapters).
    - `adapters/driven/`: Implementations for DB (Prisma), Odoo, S3, etc.
    - `adapters/driving/`: Entry points like Scheduler and WebSocket.
    - `core/services/`: Business logic.
    - `core/entities/`: Domain models/schemas.
- **Framework:** FastAPI with `uv` for dependency management.
- **Database:** Prisma (schema in `backend/schema.prisma`) with SQLite (`tasks.db`).
- **Integration:** XML-RPC for Odoo connectivity (`backend/app/rpc.py`).
- **Automation:** APScheduler for background jobs.

### Frontend (React/Vite)
- **Framework:** React 18, TypeScript, Vite.
- **Architecture:** Clean Architecture
    - `domain/`: Pure business logic and models.
    - `ports/`: Interface definitions for external services.
    - `adapters/`: Concrete implementations (API calls, WebSockets).
    - `ui/`: React components, hooks, and features.
- **Styling:** Tailwind CSS + custom theme (defined in `design.md` and `frontend/tailwind.config.js`).
- **Icons:** Lucide React (used sparingly or converted to ASCII-like styles).

## Key Workflows for Agents
1.  **Odoo Integration:** Check `backend/app/rpc.py` and `frontend/src/adapters/api/AxiosOdooRepository.ts`.
2.  **Task Management:** Central domain is in `frontend/src/domain/models/Task.ts`.
3.  **Styling Changes:** Always refer to `design.md`. Never use sans-serif fonts.
4.  **Backend Changes:** Follow the `ruff` linting rules and use `uv` for new packages.

## Domain Language
- **Cron:** Scheduled Odoo tasks.
- **Webhook:** External triggers for task automation.
- **OdooEnv:** Configuration for Odoo connection (URL, DB, API Key).
- **Audit Log:** History of system actions.
