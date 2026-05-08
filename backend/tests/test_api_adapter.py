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
