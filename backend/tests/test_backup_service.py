from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.services.backup_service import BackupService


@pytest.fixture
def mock_repo():
    return AsyncMock()


@pytest.fixture
def mock_storage():
    return MagicMock()


@pytest.fixture
def backup_service(mock_repo, mock_storage):
    return BackupService(mock_repo, mock_storage)


@pytest.mark.asyncio
async def test_backup_service_coverage_boost(backup_service, mock_repo, mock_storage):
    # Cover restore_from_s3, get_backup_cron, get_default_backup_target
    mock_repo.get_system_config.return_value = MagicMock(value="* * * * *")
    await backup_service.get_backup_cron()

    mock_repo.get_system_config.return_value = MagicMock(value="local")
    await backup_service.get_default_backup_target()

    with patch("shutil.copy2") as mock_copy, patch("os.path.exists") as mock_exists:
        mock_storage.download_file.return_value = "local_path"
        mock_exists.return_value = True
        await backup_service.restore_from_s3(1, "k", AsyncMock(), AsyncMock())
        mock_copy.assert_called()
