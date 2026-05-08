import pytest
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime
from app.core.services.task_service import TaskService
from app.core.entities.models import TaskSchema

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def mock_external_api():
    return MagicMock()

@pytest.fixture
def mock_notification():
    return AsyncMock()

@pytest.fixture
def mock_broadcast():
    return AsyncMock()

@pytest.fixture
def mock_odoo():
    return MagicMock()

@pytest.fixture
def mock_storage():
    return MagicMock()

@pytest.fixture
def task_service(mock_repo, mock_external_api, mock_notification, mock_broadcast, mock_odoo, mock_storage):
    return TaskService(
        repository=mock_repo,
        external_api=mock_external_api,
        notification=mock_notification,
        broadcast=mock_broadcast,
        odoo_port=mock_odoo,
        storage=mock_storage
    )

@pytest.mark.asyncio
async def test_list_tasks(task_service, mock_repo):
    mock_repo.get_tasks.return_value = []
    tasks = await task_service.list_tasks()
    assert tasks == []
    mock_repo.get_tasks.assert_called_once()

@pytest.mark.asyncio
async def test_create_task(task_service, mock_repo, mock_broadcast):
    task_data = TaskSchema(name="Test", description="Desc", task_type="generic")
    mock_repo.create_task.return_value = MagicMock(id=1, name="Test", model_dump=lambda: {"id": 1, "name": "Test"})
    
    result = await task_service.create_task(task_data)
    
    assert result.id == 1
    mock_repo.create_task.assert_called_once()
    mock_repo.add_audit_log.assert_called_once()
    mock_broadcast.broadcast.assert_called_once()

@pytest.mark.asyncio
async def test_update_task_status(task_service, mock_repo, mock_broadcast):
    mock_repo.update_task_status.return_value = MagicMock(id=1, name="Test", odoo_env_id=None)
    
    result = await task_service.update_task_status(1, "done")
    
    assert result.id == 1
    mock_repo.update_task_status.assert_called_once_with(1, "done")
    mock_broadcast.broadcast.assert_called_once()

@pytest.mark.asyncio
async def test_execute_task_weather(task_service, mock_repo, mock_external_api, mock_broadcast):
    db_task = MagicMock(id=1, name="Weather", task_type="weather", dependencies=None)
    mock_repo.get_task_by_id.return_value = db_task
    mock_external_api.get_weather.return_value = "Sunny"
    mock_repo.create_task_history.return_value = MagicMock(id=1, task_id=1, task_name="Weather", result="Sunny", timestamp=datetime.now())
    mock_repo.get_webhooks.return_value = []
    mock_repo.get_notification_configs.return_value = []
    
    result = await task_service.execute_task(1)
    
    assert result == "Sunny"
    mock_external_api.get_weather.assert_called_once()

@pytest.mark.asyncio
async def test_start_stop_timer(task_service, mock_repo):
    start_time = datetime.utcnow()
    db_task = MagicMock(id=1, timer_started_at=start_time, total_seconds=100)
    mock_repo.get_task_by_id.return_value = db_task
    
    # Test start
    await task_service.start_timer(1)
    mock_repo.update_task_timer.assert_called_once()
    
    # Test stop
    mock_repo.update_task_timer.reset_mock()
    result = await task_service.stop_timer(1)
    assert result["status"] == "success"
    mock_repo.update_task_timer.assert_called_once()

@pytest.mark.asyncio
async def test_decompose_task(task_service, mock_repo):
    db_task = MagicMock(id=1, name="Refactor task", description="refactor code", task_type="generic", priority=3, project_id=1)
    mock_repo.get_task_by_id.return_value = db_task
    mock_repo.create_task.return_value = MagicMock(id=2)
    
    subtasks = await task_service.decompose_task(1)
    
    assert len(subtasks) == 4
    assert mock_repo.create_task.call_count == 4
    mock_repo.add_audit_log.assert_called_once()
