from datetime import datetime

from pydantic import BaseModel


class TaskSchema(BaseModel):
    name: str
    description: str
    task_type: str
    status: str | None = "todo"
    cron_expression: str | None = None
    total_seconds: int | None = 0
    timer_started_at: datetime | None = None
    priority: int | None = 3
    deadline: datetime | None = None
    estimated_time: int | None = None
    parent_id: int | None = None
    dependencies: str | None = None
    project_id: int | None = None
    odoo_env_id: int | None = None
    odoo_project_id: int | None = None
    odoo_task_id: int | None = None


class NoteSchema(BaseModel):
    title: str
    content: str
    task_id: int | None = None
    project_id: int | None = None


class S3ConfigSchema(BaseModel):
    name: str
    endpoint: str
    region: str
    bucket: str
    access_key: str
    secret_key: str
    active: bool | None = True


class OdooEnvSchema(BaseModel):
    name: str
    url: str
    db: str
    username: str
    password: str
    color: str | None = "gray"


class WebhookConfigSchema(BaseModel):
    name: str
    type: str | None = "webhook"
    url: str | None = None
    secret: str | None = None
    target: str | None = None
    active: int | None = 1
