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
async def test_update_task_status_basic(task_service, mock_repo, mock_broadcast):
    mock_repo.update_task_status.return_value = MagicMock(id=1, name="Test", odoo_env_id=None)
    result = await task_service.update_task_status(1, "done")
    assert result.id == 1
    mock_repo.update_task_status.assert_called_once_with(1, "done")

@pytest.mark.asyncio
async def test_update_task_status_with_odoo_sync(task_service, mock_repo, mock_odoo):
    db_task = MagicMock(
        id=1, name="Odoo Task", status="todo", 
        odoo_env_id=1, odoo_project_id=10, odoo_task_id=100,
        total_seconds=3600
    )
    mock_repo.update_task_status.return_value = db_task
    mock_repo.get_odoo_env_by_id.return_value = MagicMock(
        url="http://odoo", db="db", username="user", password="pwd"
    )
    await task_service.update_task_status(1, "done")
    mock_odoo.create_timesheet.assert_called_once()

@pytest.mark.asyncio
async def test_execute_task_weather(task_service, mock_repo, mock_external_api):
    db_task = MagicMock(id=1, name="Weather", task_type="weather", dependencies=None)
    mock_repo.get_task_by_id.return_value = db_task
    mock_external_api.get_weather.return_value = "Sunny"
    mock_repo.create_task_history.return_value = MagicMock(id=1, task_id=1, timestamp=datetime.now())
    mock_repo.get_webhooks.return_value = []
    mock_repo.get_notification_configs.return_value = []
    result = await task_service.execute_task(1)
    assert result == "Sunny"

@pytest.mark.asyncio
async def test_execute_task_blocked_by_dependency(task_service, mock_repo):
    db_task = MagicMock(id=2, name="Sub Task", task_type="generic", dependencies="1")
    dep_task = MagicMock(id=1, status="todo")
    mock_repo.get_task_by_id.side_effect = [db_task, dep_task]
    result = await task_service.execute_task(2)
    assert result["status"] == "error"

@pytest.mark.asyncio
async def test_start_stop_timer(task_service, mock_repo):
    start_time = datetime.now()
    db_task = MagicMock(id=1, timer_started_at=start_time, total_seconds=100)
    mock_repo.get_task_by_id.return_value = db_task
    await task_service.start_timer(1)
    result = await task_service.stop_timer(1)
    assert result["status"] == "success"

@pytest.mark.asyncio
async def test_decompose_task(task_service, mock_repo):
    db_task = MagicMock(id=1, name="Refactor", description="refactor code", task_type="generic", priority=3, project_id=1)
    mock_repo.get_task_by_id.return_value = db_task
    mock_repo.create_task.return_value = MagicMock(id=2)
    subtasks = await task_service.decompose_task(1)
    assert len(subtasks) == 4

@pytest.mark.asyncio
async def test_rank_tasks(task_service, mock_repo):
    t1 = MagicMock(id=1, priority=1, deadline=None, estimated_time=None)
    t2 = MagicMock(id=2, priority=5, deadline=None, estimated_time=None)
    mock_repo.get_tasks.return_value = [t1, t2]
    ranked = await task_service.rank_tasks()
    assert ranked[0].id == 2

@pytest.mark.asyncio
async def test_add_attachment(task_service, mock_repo, mock_storage):
    mock_repo.get_s3_config_by_id.return_value = MagicMock(bucket="test-bucket")
    mock_storage.upload_file.return_value = {"mimetype": "image/png", "version_id": "v1"}
    await task_service.add_attachment(1, 1, "/tmp/file.png", "file.png")
    mock_repo.create_file_attachment.assert_called_once()

@pytest.mark.asyncio
async def test_get_dependency_graph(task_service, mock_repo):
    t1 = MagicMock(id=1, name="Task 1", dependencies="2")
    mock_repo.get_tasks.return_value = [t1]
    graph = await task_service.get_dependency_graph()
    assert "Task 1" in graph
    assert "depends on: 2" in graph

@pytest.mark.asyncio
async def test_delete_task(task_service, mock_repo):
    await task_service.delete_task(1)
    mock_repo.delete_task.assert_called_once_with(1)

@pytest.mark.asyncio
async def test_execute_task_ip(task_service, mock_repo, mock_external_api):
    db_task = MagicMock(id=1, name="IP", task_type="ip", dependencies=None)
    mock_repo.get_task_by_id.return_value = db_task
    mock_external_api.get_ip.return_value = "1.1.1.1"
    mock_repo.create_task_history.return_value = MagicMock()
    mock_repo.get_webhooks.return_value = []
    mock_repo.get_notification_configs.return_value = []
    
    result = await task_service.execute_task(1)
    assert result == "1.1.1.1"

@pytest.mark.asyncio
async def test_execute_task_notification(task_service, mock_repo, mock_notification):
    db_task = MagicMock(id=1, name="Notify", task_type="notification", dependencies=None, description="Msg")
    mock_repo.get_task_by_id.return_value = db_task
    mock_repo.get_notification_configs.return_value = [MagicMock()]
    mock_repo.create_task_history.return_value = MagicMock()
    mock_repo.get_webhooks.return_value = []
    
    await task_service.execute_task(1)
    mock_notification.send_notification.assert_called_once()

@pytest.mark.asyncio
async def test_get_attachments(task_service, mock_repo):
    mock_repo.get_file_attachments.return_value = []
    result = await task_service.get_attachments(1)
    assert result == []
    mock_repo.get_file_attachments.assert_called_once_with(1)

@pytest.mark.asyncio
async def test_get_attachment_url(task_service, mock_repo, mock_storage):
    att = MagicMock(key="k", bucket="b")
    mock_repo.get_attachment_by_id.return_value = att
    mock_repo.get_s3_configs.return_value = [MagicMock(bucket="b")]
    mock_storage.get_signed_url.return_value = "http://url"
    
    url = await task_service.get_attachment_url(1)
    assert url == "http://url"
