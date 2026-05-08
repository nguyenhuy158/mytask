from abc import ABC, abstractmethod
from typing import Any

from ..entities.models import (
    FileAttachmentSchema,
    NotificationConfigSchema,
    OdooEnvSchema,
    S3ConfigSchema,
    TaskSchema,
    WebhookConfigSchema,
)


class RepositoryPort(ABC):
    @abstractmethod
    async def get_tasks(self) -> list[Any]:
        pass

    @abstractmethod
    async def create_task(self, task: TaskSchema) -> Any:
        pass

    @abstractmethod
    async def update_task_status(self, task_id: int, status: str) -> Any:
        pass

    @abstractmethod
    async def delete_task(self, task_id: int) -> Any:
        pass

    @abstractmethod
    async def get_task_by_id(self, task_id: int) -> Any | None:
        pass

    @abstractmethod
    async def create_task_history(
        self, task_id: int, task_name: str, result: str
    ) -> Any:
        pass

    @abstractmethod
    async def get_history(self, take: int = 50) -> list[Any]:
        pass

    @abstractmethod
    async def add_audit_log(self, action: str, details: str) -> None:
        pass

    @abstractmethod
    async def get_audit_logs(self, take: int = 100) -> list[Any]:
        pass

    @abstractmethod
    async def get_system_config(self, key: str) -> Any | None:
        pass

    @abstractmethod
    async def upsert_system_config(self, key: str, value: str) -> Any:
        pass

    @abstractmethod
    async def get_s3_configs(self) -> list[Any]:
        pass

    @abstractmethod
    async def get_s3_config_by_id(self, config_id: int) -> Any | None:
        pass

    @abstractmethod
    async def create_s3_config(self, config: S3ConfigSchema) -> Any:
        pass

    @abstractmethod
    async def delete_s3_config(self, config_id: int) -> Any:
        pass

    @abstractmethod
    async def get_webhooks(self, active_only: bool = False) -> list[Any]:
        pass

    @abstractmethod
    async def get_webhook_by_id(self, webhook_id: int) -> Any | None:
        pass

    @abstractmethod
    async def create_webhook(self, webhook: WebhookConfigSchema) -> Any:
        pass

    @abstractmethod
    async def delete_webhook(self, webhook_id: int) -> Any:
        pass

    @abstractmethod
    async def get_odoo_envs(self) -> list[Any]:
        pass

    @abstractmethod
    async def get_odoo_env_by_id(self, env_id: int) -> Any | None:
        pass

    @abstractmethod
    async def create_odoo_env(self, env: OdooEnvSchema) -> Any:
        pass

    @abstractmethod
    async def delete_odoo_env(self, env_id: int) -> Any:
        pass

    @abstractmethod
    async def update_odoo_env(self, env_id: int, data: dict) -> Any:
        pass

    @abstractmethod
    async def set_odoo_env_default(self, env_id: int) -> None:
        pass

    @abstractmethod
    async def get_default_odoo_env(self) -> Any | None:
        pass

    @abstractmethod
    async def update_task_timer(
        self,
        task_id: int,
        timer_started_at: Any | None = None,
        total_seconds: int | None = None,
    ) -> Any:
        pass

    @abstractmethod
    async def update_task(self, task_id: int, data: dict) -> Any:
        pass

    @abstractmethod
    async def get_tasks_with_cron(self) -> list[Any]:
        pass

    @abstractmethod
    async def create_note(self, note: Any) -> Any:
        pass

    @abstractmethod
    async def get_notes(
        self, task_id: int | None = None, project_id: int | None = None
    ) -> list[Any]:
        pass

    @abstractmethod
    async def delete_note(self, note_id: int) -> Any:
        pass

    @abstractmethod
    async def get_file_attachments(self, task_id: int) -> list[Any]:
        pass

    @abstractmethod
    async def create_file_attachment(self, file: FileAttachmentSchema) -> Any:
        pass

    @abstractmethod
    async def get_attachment_by_id(self, file_id: int) -> Any | None:
        pass

    @abstractmethod
    async def delete_file_attachment(self, file_id: int) -> Any:
        pass

    @abstractmethod
    async def get_notification_configs(self, active_only: bool = False) -> list[Any]:
        pass

    @abstractmethod
    async def create_notification_config(self, config: NotificationConfigSchema) -> Any:
        pass

    @abstractmethod
    async def delete_notification_config(self, config_id: int) -> Any:
        pass
