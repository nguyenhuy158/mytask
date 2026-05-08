import pytest
import os
from unittest.mock import patch, MagicMock
from app.adapters.driven.s3_adapter import S3Adapter

@pytest.fixture
def s3_adapter():
    return S3Adapter()

@pytest.fixture
def mock_config():
    config = MagicMock()
    config.endpoint = "http://localhost:9000"
    config.access_key = "access"
    config.secret_key = "secret"
    config.region = "us-east-1"
    config.bucket = "test-bucket"
    return config

def test_backup_sqlite_db_not_found(s3_adapter):
    with patch("os.path.exists", return_value=False):
        result = s3_adapter.backup_sqlite_db()
        assert result == "Database file not found"

def test_backup_sqlite_db_success(s3_adapter):
    with patch("os.path.exists", return_value=True), \
         patch("os.makedirs"), \
         patch("shutil.copy2"), \
         patch("os.listdir", return_value=["tasks_1.db", "tasks_2.db", "tasks_3.db", "tasks_4.db", "tasks_5.db", "tasks_6.db"]), \
         patch("os.remove") as mock_remove:
        result = s3_adapter.backup_sqlite_db()
        assert "Backup created:" in result
        mock_remove.assert_called_once()

def test_upload_file(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_s3.head_object.return_value = {"VersionId": "v1", "ContentType": "text/plain"}
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.upload_file(mock_config, "local.txt", "remote.txt")
        assert result["version_id"] == "v1"
        mock_s3.upload_file.assert_called_once()

def test_get_signed_url(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_s3.generate_presigned_url.return_value = "http://signed-url"
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.get_signed_url(mock_config, "key")
        assert result == "http://signed-url"

def test_list_files(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_s3.list_objects_v2.return_value = {
            "Contents": [
                {"Key": "file1", "Size": 100, "LastModified": MagicMock(isoformat=lambda: "2023-01-01")},
                {"Key": "file2", "Size": 200, "LastModified": MagicMock(isoformat=lambda: "2023-01-02")}
            ]
        }
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.list_files(mock_config)
        assert len(result) == 2
        assert result[0]["key"] == "file2" # Sorted by last_modified reverse

def test_list_files_empty(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_s3.list_objects_v2.return_value = {}
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.list_files(mock_config)
        assert result == []

def test_delete_file(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.delete_file(mock_config, "key")
        assert "Deleted key" in result
        mock_s3.delete_object.assert_called_once()

def test_upload_backup(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.upload_backup(mock_config, "/path/to/backup.db")
        assert "Uploaded backup.db" in result
        mock_s3.upload_file.assert_called_once_with("/path/to/backup.db", "test-bucket", "backup.db")

def test_list_backups(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_s3.list_objects_v2.return_value = {
            "Contents": [
                {"Key": "tasks_1.db", "Size": 100, "LastModified": MagicMock(isoformat=lambda: "2023-01-01")},
                {"Key": "other.txt", "Size": 200, "LastModified": MagicMock(isoformat=lambda: "2023-01-02")},
                {"Key": "tasks_2.db", "Size": 300, "LastModified": MagicMock(isoformat=lambda: "2023-01-03")}
            ]
        }
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.list_backups(mock_config)
        assert len(result) == 2
        assert result[0]["key"] == "tasks_2.db"

def test_download_backup(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.download_backup(mock_config, "key", "local")
        assert "Downloaded key" in result
        mock_s3.download_file.assert_called_once()

def test_delete_backup(s3_adapter, mock_config):
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3
        
        result = s3_adapter.delete_backup(mock_config, "key")
        assert "Deleted key" in result
        mock_s3.delete_object.assert_called_once()
