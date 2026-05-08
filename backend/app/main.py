import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .adapters.driven.database import connect_db, disconnect_db
from .adapters.driven.http_adapter import HttpAdapter
from .adapters.driven.odoo_adapter import OdooAdapter
from .adapters.driven.prisma_adapter import PrismaAdapter
from .adapters.driven.s3_adapter import S3Adapter
from .adapters.driving.api_adapter import router as api_router
from .adapters.driving.scheduler_adapter import SchedulerAdapter
from .adapters.driving.websocket_adapter import WebSocketAdapter
from .core.constants import ResponseMessage
from .core.i18n import translator
from .core.services.backup_service import BackupService
from .core.services.odoo_service import OdooService
from .core.services.task_service import TaskService

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
prisma_adapter = PrismaAdapter()
http_adapter = HttpAdapter()
odoo_adapter = OdooAdapter()
s3_adapter = S3Adapter()
ws_adapter = WebSocketAdapter()
task_service = TaskService(
    repository=prisma_adapter,
    external_api=http_adapter,
    notification=http_adapter,
    broadcast=ws_adapter,
    odoo_port=odoo_adapter,
)
backup_service = BackupService(repository=prisma_adapter, storage=s3_adapter)
odoo_service = OdooService(repository=prisma_adapter, odoo_port=odoo_adapter)
scheduler = SchedulerAdapter(task_service=task_service, backup_service=backup_service)
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.on_event("startup")
async def startup_event():
    await connect_db()
    scheduler.start()
    cron_expr = await backup_service.get_backup_cron()
    scheduler.schedule_backup(cron_expr)
    tasks = await prisma_adapter.get_tasks_with_cron()
    for t in tasks:
        scheduler.schedule_task(t.id, t.cron_expression, t.name)
    await prisma_adapter.add_audit_log(
        ResponseMessage.SYSTEM_STARTUP_MSG,
        translator.translate(ResponseMessage.SYSTEM_STARTUP_MSG, lang="en"),
    )


@app.on_event("shutdown")
async def shutdown_event():
    await disconnect_db()
