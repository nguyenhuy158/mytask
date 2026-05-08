from typing import Any

from ...core.entities.models import (
    FileAttachmentSchema,
    NotificationConfigSchema,
    OdooEnvSchema,
    S3ConfigSchema,
    TaskSchema,
    WebhookConfigSchema,
)
from ...core.ports.repository import RepositoryPort
from .database import connect_db, db


class PrismaAdapter(RepositoryPort):
    async def get_tasks(self) -> list[Any]:
        return await db.taskconfig.find_many()

    async def create_task(self, task: TaskSchema) -> Any:
        return await db.taskconfig.create(data=task.model_dump())

    async def update_task_status(self, task_id: int, status: str) -> Any:
        return await db.taskconfig.update(
            where={"id": task_id}, data={"status": status}
        )

    async def delete_task(self, task_id: int) -> Any:
        return await db.taskconfig.delete(where={"id": task_id})

    async def get_task_by_id(self, task_id: int) -> Any | None:
        return await db.taskconfig.find_unique(where={"id": task_id})

    async def create_task_history(
        self, task_id: int, task_name: str, result: str
    ) -> Any:
        return await db.taskhistory.create(
            data={"task_id": task_id, "task_name": task_name, "result": result}
        )

    async def get_history(self, take: int = 50) -> list[Any]:
        return await db.taskhistory.find_many(order={"timestamp": "desc"}, take=take)

    async def add_audit_log(self, action: str, details: str) -> None:
        await connect_db()
        await db.auditlog.create(data={"action": action, "details": details})

    async def get_audit_logs(self, skip: int = 0, take: int = 20) -> list[Any]:
        return await db.auditlog.find_many(
            order={"timestamp": "desc"}, skip=skip, take=take
        )

    async def count_audit_logs(self) -> int:
        return await db.auditlog.count()

    async def get_system_config(self, key: str) -> Any | None:
        return await db.systemconfig.find_unique(where={"key": key})

    async def upsert_system_config(self, key: str, value: str) -> Any:
        return await db.systemconfig.upsert(
            where={"key": key},
            data={
                "create": {"key": key, "value": value},
                "update": {"value": value},
            },
        )

    async def get_s3_configs(self) -> list[Any]:
        return await db.s3config.find_many()

    async def get_s3_config_by_id(self, config_id: int) -> Any | None:
        return await db.s3config.find_unique(where={"id": config_id})

    async def create_s3_config(self, config: S3ConfigSchema) -> Any:
        return await db.s3config.create(data=config.model_dump())

    async def delete_s3_config(self, config_id: int) -> Any:
        return await db.s3config.delete(where={"id": config_id})

    async def get_webhooks(self, active_only: bool = False) -> list[Any]:
        if active_only:
            return await db.webhookconfig.find_many(where={"active": 1})
        return await db.webhookconfig.find_many()

    async def get_webhook_by_id(self, webhook_id: int) -> Any | None:
        return await db.webhookconfig.find_unique(where={"id": webhook_id})

    async def create_webhook(self, webhook: WebhookConfigSchema) -> Any:
        return await db.webhookconfig.create(data=webhook.model_dump())

    async def delete_webhook(self, webhook_id: int) -> Any:
        return await db.webhookconfig.delete(where={"id": webhook_id})

    async def get_odoo_envs(self) -> list[Any]:
        return await db.odooenv.find_many()

    async def get_odoo_env_by_id(self, env_id: int) -> Any | None:
        return await db.odooenv.find_unique(where={"id": env_id})

    async def create_odoo_env(self, env: OdooEnvSchema) -> Any:
        return await db.odooenv.create(data=env.model_dump())

    async def delete_odoo_env(self, env_id: int) -> Any:
        return await db.odooenv.delete(where={"id": env_id})

    async def update_odoo_env(self, env_id: int, data: dict) -> Any:
        return await db.odooenv.update(where={"id": env_id}, data=data)

    async def set_odoo_env_default(self, env_id: int) -> None:
        await connect_db()
        await db.odooenv.update_many(
            where={"is_default": True}, data={"is_default": False}
        )
        await db.odooenv.update(where={"id": env_id}, data={"is_default": True})
        await self.add_audit_log("SET_DEFAULT_ENV", f"Env ID: {env_id}")

    async def get_default_odoo_env(self) -> Any | None:
        return await db.odooenv.find_first(where={"is_default": True})

    async def update_task_timer(
        self,
        task_id: int,
        timer_started_at: Any | None = None,
        total_seconds: int | None = None,
    ) -> Any:
        data = {}
        data["timer_started_at"] = timer_started_at
        if total_seconds is not None:
            data["total_seconds"] = total_seconds
        return await db.taskconfig.update(where={"id": task_id}, data=data)

    async def update_task(self, task_id: int, data: dict) -> Any:
        return await db.taskconfig.update(where={"id": task_id}, data=data)

    async def get_tasks_with_cron(self) -> list[Any]:
        return await db.taskconfig.find_many(where={"cron_expression": {"not": None}})

    async def create_note(self, note: Any) -> Any:
        return await db.note.create(
            data=note.model_dump() if hasattr(note, "model_dump") else note
        )

    async def get_notes(
        self, task_id: int | None = None, project_id: int | None = None
    ) -> list[Any]:
        where = {}
        if task_id:
            where["task_id"] = task_id
        if project_id:
            where["project_id"] = project_id
        return await db.note.find_many(where=where, order={"timestamp": "desc"})

    async def delete_note(self, note_id: int) -> Any:
        return await db.note.delete(where={"id": note_id})

    async def get_file_attachments(self, task_id: int) -> list[Any]:
        return await db.fileattachment.find_many(
            where={"task_id": task_id}, order={"timestamp": "desc"}
        )

    async def create_file_attachment(self, file: FileAttachmentSchema) -> Any:
        return await db.fileattachment.create(data=file.model_dump())

    async def get_attachment_by_id(self, file_id: int) -> Any | None:
        return await db.fileattachment.find_unique(where={"id": file_id})

    async def delete_file_attachment(self, file_id: int) -> Any:
        return await db.fileattachment.delete(where={"id": file_id})

    async def get_notification_configs(self, active_only: bool = False) -> list[Any]:
        if active_only:
            return await db.notificationconfig.find_many(where={"active": True})
        return await db.notificationconfig.find_many()

    async def create_notification_config(self, config: NotificationConfigSchema) -> Any:
        return await db.notificationconfig.create(data=config.model_dump())

    async def delete_notification_config(self, config_id: int) -> Any:
        return await db.notificationconfig.delete(where={"id": config_id})
