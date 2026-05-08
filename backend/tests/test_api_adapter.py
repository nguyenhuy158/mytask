import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import MagicMock, AsyncMock
from app.main import app
from app.adapters.driving.api_adapter import (
    get_task_service, 
    get_prisma_adapter, 
    get_backup_service,
    get_odoo_service
)

# Mocking services
mock_task_service = AsyncMock()
mock_prisma_adapter = AsyncMock()
mock_backup_service = AsyncMock()
mock_odoo_service = AsyncMock()

@pytest.fixture
def override_dependencies():
    app.dependency_overrides[get_task_service] = lambda: mock_task_service
    app.dependency_overrides[get_prisma_adapter] = lambda: mock_prisma_adapter
    app.dependency_overrides[get_backup_service] = lambda: mock_backup_service
    app.dependency_overrides[get_odoo_service] = lambda: mock_odoo_service
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_tasks_api(override_dependencies):
    mock_task_service.list_tasks.return_value = [{"id": 1, "name": "Task 1"}]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/tasks")
    assert response.status_code == 200
    assert response.json() == [{"id": 1, "name": "Task 1"}]

@pytest.mark.asyncio
async def test_get_history_api(override_dependencies):
    mock_task_service.get_history.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/history")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_audit_logs_api(override_dependencies):
    mock_task_service.get_audit_logs.return_value = {"logs": [], "total": 0}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/audit-logs")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_list_notes_api(override_dependencies):
    mock_task_service.list_notes.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/notes")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_odoo_envs_api(override_dependencies):
    mock_odoo_service.list_envs.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/envs")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_s3_configs_api(override_dependencies):
    mock_prisma_adapter.get_s3_configs.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/s3-configs")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_ranked_tasks_api(override_dependencies):
    mock_task_service.rank_tasks.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/tasks/ranked")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_dependency_graph_api(override_dependencies):
    mock_task_service.get_dependency_graph.return_value = "graph"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/tasks/dependency-graph")
    assert response.status_code == 200
    assert response.json() == {"graph": "graph"}

@pytest.mark.asyncio
async def test_get_config_api(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/config")
    assert response.status_code == 200
    assert "content" in response.json()

@pytest.mark.asyncio
async def test_create_task_api(override_dependencies):
    task_data = {
        "name": "New Task", 
        "description": "Desc", 
        "task_type": "manual",
        "priority": 1, 
        "status": "pending"
    }
    mock_task_service.create_task.return_value = MagicMock(id=1, name="New Task", cron_expression=None)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/tasks", json=task_data)
    assert response.status_code == 200
    mock_task_service.create_task.assert_called_once()

@pytest.mark.asyncio
async def test_update_task_status_api(override_dependencies):
    mock_task_service.update_task_status.return_value = {"id": 1, "status": "completed"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.patch("/tasks/1/status?status=completed")
    assert response.status_code == 200
    mock_task_service.update_task_status.assert_called_once_with(1, "completed")

@pytest.mark.asyncio
async def test_delete_task_api(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/tasks/1")
    assert response.status_code == 200
    mock_task_service.delete_task.assert_called_once_with(1)

@pytest.mark.asyncio
async def test_run_task_api(override_dependencies):
    mock_task_service.execute_task.return_value = "Result"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/tasks/1/run")
    assert response.status_code == 200
    assert response.json()["result"] == "Result"
    mock_task_service.execute_task.assert_called_once_with(1)

@pytest.mark.asyncio
async def test_create_note_api(override_dependencies):
    note_data = {"title": "Title", "content": "New Note"}
    mock_task_service.create_note.return_value = {"id": 1, "title": "Title", "content": "New Note"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/notes", json=note_data)
    assert response.status_code == 200
    mock_task_service.create_note.assert_called_once()

@pytest.mark.asyncio
async def test_create_env_api(override_dependencies):
    env_data = {
        "name": "Dev",
        "url": "http://odoo.dev",
        "db": "dev_db",
        "username": "admin",
        "password": "password"
    }
    mock_odoo_service.create_env.return_value = MagicMock(id=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/envs", json=env_data)
    assert response.status_code == 200
    mock_odoo_service.create_env.assert_called_once()

@pytest.mark.asyncio
async def test_manual_backup_api(override_dependencies):
    mock_backup_service.run_backup_job.return_value = "backup.db"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/tasks/backup")
    assert response.status_code == 200
    mock_backup_service.run_backup_job.assert_called_once()

@pytest.mark.asyncio
async def test_get_odoo_crons_api(override_dependencies):
    mock_odoo_service.get_effective_env.return_value = MagicMock(id=1)
    mock_odoo_service.get_crons.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/odoo/1/crons")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_toggle_odoo_cron_api(override_dependencies):
    mock_odoo_service.get_effective_env.return_value = MagicMock(id=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/odoo/1/crons/123/toggle?active=true")
    assert response.status_code == 200
    mock_odoo_service.toggle_cron.assert_called_once()

@pytest.mark.asyncio
async def test_get_disbursement_report_api(override_dependencies):
    mock_odoo_service.get_effective_env.return_value = MagicMock(id=1)
    mock_odoo_service.get_disbursement_report.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/odoo/1/disbursement-report")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_list_s3_backups_api(override_dependencies):
    mock_backup_service.list_s3_backups.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/s3/1/backups")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_list_local_backups_api(override_dependencies):
    mock_backup_service.list_local_backups.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/backups")
    assert response.status_code == 200

    assert response.status_code == 200

@pytest.mark.asyncio
async def test_create_s3_config_api(override_dependencies):
    config_data = {
        "name": "S3", "endpoint": "http://e", "region": "r", 
        "bucket": "b", "access_key": "a", "secret_key": "s"
    }
    mock_prisma_adapter.create_s3_config.return_value = MagicMock(id=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/s3-configs", json=config_data)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_delete_s3_config_api(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/s3-configs/1")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_backup_to_s3_api(override_dependencies):
    mock_backup_service.backup_to_s3.return_value = "Done"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/s3/1/backup")
    assert response.status_code == 200
    assert response.json()["result"] == "Done"

@pytest.mark.asyncio
async def test_restore_from_s3_api(override_dependencies):
    mock_backup_service.restore_from_s3.return_value = "Restored"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/s3/1/restore/key")
    assert response.status_code == 200
    assert response.json()["result"] == "Restored"

@pytest.mark.asyncio
async def test_delete_s3_backup_api(override_dependencies):
    mock_backup_service.delete_s3_backup.return_value = "Deleted"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/s3/1/backups/key")
    assert response.status_code == 200
    assert response.json()["result"] == "Deleted"

@pytest.mark.asyncio
async def test_get_notifications_api(override_dependencies):
    mock_prisma_adapter.get_notification_configs.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/notifications")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_webhooks_api(override_dependencies):
    mock_prisma_adapter.get_webhooks.return_value = []
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/webhooks")
    assert response.status_code == 200

    assert response.status_code == 200

@pytest.mark.asyncio
async def test_create_notification_api(override_dependencies):
    config_data = {"name": "N", "type": "slack", "webhook_url": "http://w"}
    mock_prisma_adapter.create_notification_config.return_value = MagicMock(id=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/notifications", json=config_data)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_delete_notification_api(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/notifications/1")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_set_default_env_api(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/envs/1/set-default")
    assert response.status_code == 200
    mock_odoo_service.set_default_env.assert_called_once_with(1)

@pytest.mark.asyncio
async def test_duplicate_env_api(override_dependencies):
    mock_odoo_service.duplicate_env.return_value = {"id": 2, "name": "Copy"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/envs/1/duplicate")
    assert response.status_code == 200
    mock_odoo_service.duplicate_env.assert_called_once_with(1)

@pytest.mark.asyncio
async def test_delete_env_api(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/envs/1")
    assert response.status_code == 200
    mock_odoo_service.delete_env.assert_called_once_with(1)
