import pytest
from unittest.mock import MagicMock, patch
from app.adapters.driving.scheduler_adapter import SchedulerAdapter

@pytest.fixture
def mock_task_service():
    return MagicMock()

@pytest.fixture
def mock_backup_service():
    return MagicMock()

@pytest.fixture
def scheduler_adapter(mock_task_service, mock_backup_service):
    with patch("app.adapters.driving.scheduler_adapter.AsyncIOScheduler"):
        adapter = SchedulerAdapter(mock_task_service, mock_backup_service)
        return adapter

def test_start(scheduler_adapter):
    scheduler_adapter.start()
    scheduler_adapter.scheduler.start.assert_called_once()

def test_schedule_task_new(scheduler_adapter):
    scheduler_adapter.scheduler.get_job.return_value = None
    scheduler_adapter.schedule_task(1, "*/5 * * * *", "Test Task")
    
    scheduler_adapter.scheduler.add_job.assert_called_once()
    args, kwargs = scheduler_adapter.scheduler.add_job.call_args
    assert kwargs["id"] == "task_1"
    assert kwargs["args"] == [1]

def test_schedule_task_update(scheduler_adapter):
    scheduler_adapter.scheduler.get_job.return_value = MagicMock()
    scheduler_adapter.schedule_task(1, "*/5 * * * *", "Test Task")
    
    scheduler_adapter.scheduler.remove_job.assert_called_once_with("task_1")
    scheduler_adapter.scheduler.add_job.assert_called_once()

def test_schedule_task_invalid_cron(scheduler_adapter):
    scheduler_adapter.scheduler.get_job.return_value = None
    
    with patch("app.adapters.driving.scheduler_adapter.CronTrigger.from_crontab", side_effect=Exception("Invalid cron")):
        # Should not raise
        scheduler_adapter.schedule_task(1, "invalid", "Test Task")
        scheduler_adapter.scheduler.add_job.assert_not_called()

def test_remove_task(scheduler_adapter):
    scheduler_adapter.scheduler.get_job.return_value = MagicMock()
    scheduler_adapter.remove_task(1)
    scheduler_adapter.scheduler.remove_job.assert_called_once_with("task_1")

def test_schedule_backup(scheduler_adapter):
    scheduler_adapter.scheduler.get_job.return_value = None
    scheduler_adapter.schedule_backup("0 0 * * *")
    
    scheduler_adapter.scheduler.add_job.assert_called_once()
    kwargs = scheduler_adapter.scheduler.add_job.call_args[1]
    assert kwargs["id"] == "backup_db"

def test_get_jobs(scheduler_adapter):
    scheduler_adapter.scheduler.get_jobs.return_value = []
    jobs = scheduler_adapter.get_jobs()
    assert jobs == []
    scheduler_adapter.scheduler.get_jobs.assert_called_once()
