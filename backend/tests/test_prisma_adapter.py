import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from app.adapters.driven.prisma_adapter import PrismaAdapter
from app.core.entities.models import (
    TaskSchema, 
    S3ConfigSchema, 
    WebhookConfigSchema, 
    OdooEnvSchema,
    NotificationConfigSchema
)

@pytest.fixture
def prisma_adapter():
    return PrismaAdapter()

@pytest.mark.asyncio
async def test_task_operations(prisma_adapter):
    with patch("app.adapters.driven.prisma_adapter.db", new_callable=AsyncMock) as mock_db:
        # Get tasks
        mock_db.taskconfig.find_many.return_value = []
        await prisma_adapter.get_tasks()
        
        # Create task
        await prisma_adapter.create_task(TaskSchema(name="T", description="D", task_type="generic"))
        
        # Update status
        await prisma_adapter.update_task_status(1, "done")
        
        # Delete task
        await prisma_adapter.delete_task(1)
        
        # Get by id
        await prisma_adapter.get_task_by_id(1)
        
        assert mock_db.taskconfig.find_many.called
        assert mock_db.taskconfig.create.called
        assert mock_db.taskconfig.update.called
        assert mock_db.taskconfig.delete.called

@pytest.mark.asyncio
async def test_history_and_audit(prisma_adapter):
    with patch("app.adapters.driven.prisma_adapter.db", new_callable=AsyncMock) as mock_db, \
         patch("app.adapters.driven.prisma_adapter.connect_db", new_callable=AsyncMock):
        await prisma_adapter.create_task_history(1, "Name", "Result")
        await prisma_adapter.get_history(take=10)
        await prisma_adapter.add_audit_log("Action", "Details")
        await prisma_adapter.get_audit_logs(skip=0, take=5)
        await prisma_adapter.count_audit_logs()
        
        assert mock_db.taskhistory.create.called
        assert mock_db.auditlog.create.called

@pytest.mark.asyncio
async def test_config_operations(prisma_adapter):
    with patch("app.adapters.driven.prisma_adapter.db", new_callable=AsyncMock) as mock_db:
        await prisma_adapter.get_system_config("key")
        await prisma_adapter.upsert_system_config("key", "value")
        
        assert mock_db.systemconfig.find_unique.called
        assert mock_db.systemconfig.upsert.called

@pytest.mark.asyncio
async def test_s3_operations(prisma_adapter):
    with patch("app.adapters.driven.prisma_adapter.db", new_callable=AsyncMock) as mock_db:
        await prisma_adapter.get_s3_configs()
        await prisma_adapter.get_s3_config_by_id(1)
        await prisma_adapter.create_s3_config(S3ConfigSchema(
            name="S3", bucket="B", endpoint="E", access_key="A", secret_key="S", region="us-east-1"
        ))
        await prisma_adapter.delete_s3_config(1)
        
        assert mock_db.s3config.find_many.called
        assert mock_db.s3config.create.called

@pytest.mark.asyncio
async def test_webhook_operations(prisma_adapter):
    with patch("app.adapters.driven.prisma_adapter.db", new_callable=AsyncMock) as mock_db:
        await prisma_adapter.get_webhooks(active_only=True)
        await prisma_adapter.get_webhook_by_id(1)
        await prisma_adapter.create_webhook(WebhookConfigSchema(name="W", url="U", active=1))
        await prisma_adapter.delete_webhook(1)
        
        assert mock_db.webhookconfig.find_many.called
        assert mock_db.webhookconfig.create.called

@pytest.mark.asyncio
async def test_odoo_operations(prisma_adapter):
    with patch("app.adapters.driven.prisma_adapter.db", new_callable=AsyncMock) as mock_db:
        await prisma_adapter.get_odoo_envs()
        await prisma_adapter.get_odoo_env_by_id(1)
        await prisma_adapter.create_odoo_env(OdooEnvSchema(name="O", url="U", db="D", username="UN", password="PW"))
        await prisma_adapter.update_odoo_env(1, {"name": "New"})
        await prisma_adapter.delete_odoo_env(1)
        await prisma_adapter.get_default_odoo_env()
        await prisma_adapter.set_odoo_env_default(1)
        
        assert mock_db.odooenv.find_many.called
        assert mock_db.odooenv.update.called

@pytest.mark.asyncio
async def test_notification_operations(prisma_adapter):
    with patch("app.adapters.driven.prisma_adapter.db", new_callable=AsyncMock) as mock_db:
        await prisma_adapter.get_notification_configs(active_only=True)
        await prisma_adapter.create_notification_config(NotificationConfigSchema(
            name="N", type="email", target="T", webhook_url="http://hook"
        ))
        await prisma_adapter.delete_notification_config(1)
        
        assert mock_db.notificationconfig.find_many.called
        assert mock_db.notificationconfig.create.called
