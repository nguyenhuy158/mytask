import logging
import os

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# Adapters
from .adapters.driven.http_adapter import HttpAdapter
from .adapters.driven.odoo_adapter import OdooAdapter
from .adapters.driven.prisma_adapter import PrismaAdapter
from .adapters.driven.s3_adapter import S3Adapter
from .adapters.driving.scheduler_adapter import SchedulerAdapter
from .adapters.driving.websocket_adapter import WebSocketAdapter
from .core.constants import ResponseMessage

# Core
from .core.entities.models import (
    NoteSchema,
    OdooEnvSchema,
    S3ConfigSchema,
    TaskSchema,
    WebhookConfigSchema,
)
from .core.i18n import get_language, translator
from .core.services.backup_service import BackupService
from .core.services.odoo_service import OdooService
from .core.services.task_service import TaskService
from .database import connect_db, disconnect_db
from .rpc import handle_rpc_request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Adapters
prisma_adapter = PrismaAdapter()
http_adapter = HttpAdapter()
odoo_adapter = OdooAdapter()
s3_adapter = S3Adapter()
ws_adapter = WebSocketAdapter()

# Initialize Services
task_service = TaskService(
    repository=prisma_adapter,
    external_api=http_adapter,
    notification=http_adapter,
    broadcast=ws_adapter,
    odoo_port=odoo_adapter,
)
backup_service = BackupService(repository=prisma_adapter, storage=s3_adapter)
odoo_service = OdooService(repository=prisma_adapter, odoo_port=odoo_adapter)

# Scheduler
scheduler = SchedulerAdapter(task_service=task_service, backup_service=backup_service)

# FastAPI Setup
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


# Dependencies
def get_task_service():
    return task_service


def get_backup_service():
    return backup_service


def get_odoo_service():
    return odoo_service


# WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_adapter.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_adapter.disconnect(websocket)


# Lifespan / Events
@app.on_event("startup")
async def startup_event():
    await connect_db()
    scheduler.start()

    # Schedule backup job
    cron_expr = await backup_service.get_backup_cron()
    scheduler.schedule_backup(cron_expr)

    # Schedule all tasks
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


# API Endpoints
@app.get("/tasks")
async def list_tasks(service: TaskService = Depends(get_task_service)):
    return await service.list_tasks()


@app.post("/tasks")
@limiter.limit("10/minute")
async def create_task(
    task: TaskSchema,
    request: Request,
    service: TaskService = Depends(get_task_service),
):
    db_task = await service.create_task(task)
    if db_task.cron_expression:
        scheduler.schedule_task(db_task.id, db_task.cron_expression, db_task.name)
    return db_task


@app.patch("/tasks/{task_id}/status")
async def update_task_status(
    task_id: int, status: str, service: TaskService = Depends(get_task_service)
):
    return await service.update_task_status(task_id, status)


@app.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    request: Request,
    service: TaskService = Depends(get_task_service),
):
    await service.delete_task(task_id)
    scheduler.remove_task(task_id)
    lang = get_language(request)
    return {"status": translator.translate(ResponseMessage.SUCCESS, lang=lang)}


@app.post("/tasks/{task_id}/run")
@limiter.limit("5/minute")
async def trigger_task(
    task_id: int,
    request: Request,
    service: TaskService = Depends(get_task_service),
):
    result = await service.execute_task(task_id)
    if result is None:
        raise HTTPException(status_code=404)
    return {"status": "success", "result": result}


@app.post("/tasks/{task_id}/decompose")
async def decompose_task(
    task_id: int, service: TaskService = Depends(get_task_service)
):
    return await service.decompose_task(task_id)


@app.get("/tasks/ranked")
async def get_ranked_tasks(service: TaskService = Depends(get_task_service)):
    return await service.rank_tasks()


@app.get("/tasks/dependency-graph")
async def get_dependency_graph(service: TaskService = Depends(get_task_service)):
    return {"graph": await service.get_dependency_graph()}


@app.post("/tasks/{task_id}/branch")
async def create_task_branch(
    task_id: int, service: TaskService = Depends(get_task_service)
):
    import subprocess

    try:
        branch_name = f"feature/task-{task_id}"
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        return {"status": "success", "branch": branch_name}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/notes")
async def list_notes(
    task_id: int | None = None,
    project_id: int | None = None,
    service: TaskService = Depends(get_task_service),
):
    return await service.list_notes(task_id, project_id)


@app.post("/notes")
async def create_note(
    note: NoteSchema, service: TaskService = Depends(get_task_service)
):
    return await service.create_note(note)


@app.post("/odoo/{env_id}/shell")
async def odoo_shell(
    env_id: int, data: dict, service: OdooService = Depends(get_odoo_service)
):
    script = data.get("script", "")
    return await service.execute_remote_shell(env_id, script)


@app.post("/system/logs/stream")
async def stream_logs(message: str, ws: WebSocketAdapter = Depends(lambda: ws_adapter)):
    await ws.broadcast({"type": "LOG_STREAM", "message": message})
    return {"status": "success"}


@app.post("/tasks/{task_id}/timer/start")
async def start_timer(task_id: int, service: TaskService = Depends(get_task_service)):
    await service.start_timer(task_id)
    return {"status": "success"}


@app.post("/tasks/{task_id}/timer/stop")
async def stop_timer(task_id: int, service: TaskService = Depends(get_task_service)):
    return await service.stop_timer(task_id)


@app.get("/tasks/export")
async def export_tasks(service: TaskService = Depends(get_task_service)):
    return await service.list_tasks()


@app.post("/tasks/backup")
async def manual_backup(
    request: Request, service: BackupService = Depends(get_backup_service)
):
    result = await service.run_backup_job()
    lang = get_language(request)
    return {
        "status": translator.translate(ResponseMessage.SUCCESS, lang=lang),
        "result": translator.translate("BACKUP_COMPLETED", lang=lang, result=result),
    }


# S3 Endpoints
@app.get("/s3-configs")
async def get_s3_configs():
    return await prisma_adapter.get_s3_configs()


@app.post("/s3-configs")
async def create_s3_config(config: S3ConfigSchema):
    return await prisma_adapter.create_s3_config(config)


@app.delete("/s3-configs/{id}")
async def delete_s3_config(id: int):
    await prisma_adapter.delete_s3_config(id)
    return {"status": "success"}


@app.post("/s3-configs/test")
async def test_s3_config_raw(config: S3ConfigSchema):
    try:
        s3_adapter.list_backups(config)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/s3/{config_id}/backups")
async def list_s3_backups(
    config_id: int,
    request: Request,
    service: BackupService = Depends(get_backup_service),
):
    try:
        return await service.list_s3_backups(config_id)
    except Exception as e:
        lang = get_language(request)
        detail = (
            translator.translate(ResponseMessage.S3_NOT_FOUND, lang=lang)
            if "S3 configuration not found" in str(e)
            else str(e)
        )
        raise HTTPException(status_code=404, detail=detail) from e


@app.post("/s3/{config_id}/backup")
async def backup_to_s3(
    config_id: int, service: BackupService = Depends(get_backup_service)
):
    try:
        result = await service.backup_to_s3(config_id)
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/s3/{config_id}/restore/{key}")
async def restore_from_s3(
    config_id: int, key: str, service: BackupService = Depends(get_backup_service)
):
    try:
        result = await service.restore_from_s3(
            config_id, key, disconnect_db, connect_db
        )
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.delete("/s3/{config_id}/backups/{key}")
async def delete_s3_backup(
    config_id: int, key: str, service: BackupService = Depends(get_backup_service)
):
    try:
        result = await service.delete_s3_backup(config_id, key)
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/config")
async def get_config():
    return {
        "content": "\n".join([f"{k}={v}" for k, v in os.environ.items()]),
        "path": os.getcwd(),
    }


@app.post("/odoo/test-connection")
async def test_odoo_connection_raw(
    env: OdooEnvSchema, service: OdooService = Depends(get_odoo_service)
):
    try:
        success = await service.test_connection_raw(env)
        return {"status": "success" if success else "error"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/odoo/{env_id}/test")
async def test_odoo_env(env_id: int, service: OdooService = Depends(get_odoo_service)):
    try:
        success = await service.test_connection(env_id)
        return {"status": "success" if success else "error"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/odoo/{env_id}/crons")
async def get_odoo_crons(env_id: int, service: OdooService = Depends(get_odoo_service)):
    try:
        return await service.get_crons(env_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/odoo/{env_id}/disbursement-report")
async def get_odoo_disbursement_report(
    env_id: int, service: OdooService = Depends(get_odoo_service)
):
    try:
        return await service.get_disbursement_report(env_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/odoo/{env_id}/crons/{cron_id}/toggle")
async def toggle_odoo_cron(
    env_id: int,
    cron_id: int,
    active: bool,
    service: OdooService = Depends(get_odoo_service),
):
    try:
        await service.toggle_cron(env_id, cron_id, active)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/odoo/{env_id}/crons/{cron_id}/run")
async def run_odoo_cron(
    env_id: int, cron_id: int, service: OdooService = Depends(get_odoo_service)
):
    try:
        await service.run_cron(env_id, cron_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/history")
async def get_history(service: TaskService = Depends(get_task_service)):
    return await service.get_history()


@app.get("/audit-logs")
async def get_audit_logs(service: TaskService = Depends(get_task_service)):
    return await service.get_audit_logs()


@app.get("/health/scheduler")
async def scheduler_health():
    jobs = [
        {
            "id": j.id,
            "name": j.name,
            "next_run": j.next_run_time.isoformat() if j.next_run_time else None,
        }
        for j in scheduler.get_jobs()
    ]
    return {"status": "running", "job_count": len(jobs), "jobs": jobs}


@app.get("/backups")
async def list_backups(service: BackupService = Depends(get_backup_service)):
    return await service.list_local_backups()


@app.get("/backups/download/{filename}")
async def download_backup(filename: str):
    file_path = os.path.join("backups", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup not found")
    return FileResponse(file_path, filename=filename)


@app.post("/backups/restore/{filename}")
async def restore_local_backup(
    filename: str, service: BackupService = Depends(get_backup_service)
):
    try:
        result = await service.restore_local_backup(
            filename,
            prisma_adapter.disconnect,
            prisma_adapter.connect,
        )
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.delete("/backups/{filename}")
async def delete_local_backup(
    filename: str, service: BackupService = Depends(get_backup_service)
):
    await service.delete_local_backup(filename)
    return {"status": "success"}


@app.get("/config/backup-cron")
async def get_backup_cron(service: BackupService = Depends(get_backup_service)):
    cron = await service.get_backup_cron()
    return {"cron": cron}


@app.post("/config/backup-cron")
async def update_backup_cron(
    data: dict, service: BackupService = Depends(get_backup_service)
):
    cron = data.get("cron", "0 * * * *")
    await service.update_backup_cron(cron)
    scheduler.schedule_backup(cron)
    return {"status": "success"}


@app.get("/config/default-backup-target")
async def get_default_backup_target(
    service: BackupService = Depends(get_backup_service),
):
    target = await service.get_default_backup_target()
    return {"target": target}


@app.post("/config/default-backup-target")
async def update_default_backup_target(
    data: dict, service: BackupService = Depends(get_backup_service)
):
    target = data.get("target", "local")
    await service.update_default_backup_target(target)
    return {"status": "success"}


@app.get("/webhooks")
async def get_webhooks():
    return await prisma_adapter.get_webhooks()


@app.post("/webhooks")
async def create_webhook(data: WebhookConfigSchema):
    return await prisma_adapter.create_webhook(data)


@app.delete("/webhooks/{id}")
async def delete_webhook(id: int):
    await prisma_adapter.delete_webhook(id)
    return {"status": "success"}


@app.post("/webhooks/{id}/test")
async def test_webhook(id: int):
    webhook = await prisma_adapter.get_webhook_by_id(id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    await http_adapter.send_notification(
        [webhook], "TEST_NOTIFICATION", "This is a test notification from mytask."
    )
    return {"status": "success"}


@app.get("/envs")
async def get_envs(service: OdooService = Depends(get_odoo_service)):
    return await service.list_envs()


@app.get("/envs/export")
async def export_envs(service: OdooService = Depends(get_odoo_service)):
    return await service.list_envs()


@app.post("/envs/import")
async def import_envs(
    envs: list[OdooEnvSchema], service: OdooService = Depends(get_odoo_service)
):
    return await service.import_envs(envs)


@app.post("/envs")
async def create_env(
    env: OdooEnvSchema, service: OdooService = Depends(get_odoo_service)
):
    return await service.create_env(env)


@app.patch("/envs/{id}")
async def update_env(
    id: int, data: dict, service: OdooService = Depends(get_odoo_service)
):
    return await service.update_env(id, data)


@app.delete("/envs/{id}")
async def delete_env(id: int, service: OdooService = Depends(get_odoo_service)):
    await service.delete_env(id)
    return {"status": "success"}


@app.post("/rpc")
@limiter.limit("30/minute")
async def rpc_endpoint(request: Request):
    data = await request.body()
    return Response(content=handle_rpc_request(data), media_type="text/xml")
