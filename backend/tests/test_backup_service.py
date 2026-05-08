import pytest
import os
from unittest.mock import MagicMock, AsyncMock, patch
from app.core.services.backup_service import BackupService

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def mock_storage():
    return MagicMock()

@pytest.fixture
def backup_service(mock_repo, mock_storage):
    return BackupService(repository=mock_repo, storage=mock_storage)

@pytest.mark.asyncio
async def test_run_backup_job_local_only(backup_service, mock_repo, mock_storage):
    mock_storage.backup_sqlite_db.return_value = "Backup created: backups/tasks_2024.db"
    mock_repo.get_system_config.return_value = MagicMock(value="local")
    
    result = await backup_service.run_backup_job()
    
    assert "backups/tasks_2024.db" in result
    mock_storage.upload_backup.assert_not_called()

@pytest.mark.asyncio
async def test_run_backup_job_with_s3(backup_service, mock_repo, mock_storage):
    mock_storage.backup_sqlite_db.return_value = "Backup created: backups/tasks_2024.db"
    mock_repo.get_system_config.return_value = MagicMock(value="s3:1")
    mock_repo.get_s3_config_by_id.return_value = MagicMock(bucket="test-bucket")
    
    await backup_service.run_backup_job()
    
    mock_storage.upload_backup.assert_called_once()

@pytest.mark.asyncio
async def test_list_local_backups(backup_service):
    with patch("os.path.exists", return_value=True), \
         patch("os.listdir", return_value=["tasks_1.db", "other.txt"]), \
         patch("os.stat") as mock_stat:
        mock_stat.return_value.st_size = 1024 * 1024
        mock_stat.return_value.st_mtime = 1600000000
        
        backups = await backup_service.list_local_backups()
        assert len(backups) == 1
        assert backups[0]["filename"] == "tasks_1.db"

@pytest.mark.asyncio
async def test_backup_to_s3(backup_service, mock_repo, mock_storage):
    mock_repo.get_s3_config_by_id.return_value = MagicMock(id=1)
    mock_storage.backup_sqlite_db.return_value = "Backup created: backups/t.db"
    
    await backup_service.backup_to_s3(1)
    
    mock_storage.upload_backup.assert_called_once()

@pytest.mark.asyncio
async def test_restore_local_backup(backup_service):
    mock_disconnect = AsyncMock()
    mock_connect = AsyncMock()
    
    with patch("os.path.exists", return_value=True), \
         patch("shutil.copy2") as mock_copy:
        
        result = await backup_service.restore_local_backup("t.db", mock_disconnect, mock_connect)
        
        assert "Restored from t.db" in result
        mock_disconnect.assert_called_once()
        mock_copy.assert_called_once()
        mock_connect.assert_called_once()

@pytest.mark.asyncio
async def test_delete_local_backup(backup_service):
    with patch("os.path.exists", return_value=True), \
         patch("os.remove") as mock_remove:
        await backup_service.delete_local_backup("t.db")
        mock_remove.assert_called_once()

@pytest.mark.asyncio
async def test_list_s3_backups(backup_service, mock_repo, mock_storage):
    mock_repo.get_s3_config_by_id.return_value = MagicMock(id=1)
    mock_storage.list_backups.return_value = [{"key": "b1.db"}]
    
    result = await backup_service.list_s3_backups(1)
    assert len(result) == 1
    assert result[0]["key"] == "b1.db"

@pytest.mark.asyncio
async def test_delete_s3_backup(backup_service, mock_repo, mock_storage):
    mock_repo.get_s3_config_by_id.return_value = MagicMock(id=1)
    mock_storage.delete_backup.return_value = "Deleted"
    
    result = await backup_service.delete_s3_backup(1, "key")
    assert result == "Deleted"
    mock_storage.delete_backup.assert_called_once()
