import os
import shutil
from datetime import datetime
from typing import Any

import boto3
from botocore.client import Config

from ...core.ports.external_services import StoragePort


class S3Adapter(StoragePort):
    def backup_sqlite_db(self) -> str:
        db_path = "tasks.db"
        backup_dir = "backups"

        if not os.path.exists(db_path):
            return "Database file not found"

        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(backup_dir, f"tasks_{timestamp}.db")

        try:
            shutil.copy2(db_path, backup_path)

            # Keep only last 5 backups
            backups = sorted(
                [f for f in os.listdir(backup_dir) if f.startswith("tasks_")]
            )
            if len(backups) > 5:
                for old_backup in backups[:-5]:
                    os.remove(os.path.join(backup_dir, old_backup))

            return f"Backup created: {backup_path}"
        except Exception as error:
            return f"Backup error: {str(error)}"

    def _get_client(self, config: Any):
        return boto3.client(
            "s3",
            endpoint_url=config.endpoint,
            aws_access_key_id=config.access_key,
            aws_secret_access_key=config.secret_key,
            region_name=config.region,
            config=Config(signature_version="s3v4"),
        )

    def upload_backup(self, config: Any, local_file_path: str) -> str:
        s3 = self._get_client(config)
        file_name = os.path.basename(local_file_path)
        s3.upload_file(local_file_path, config.bucket, file_name)
        return f"Uploaded {file_name} to {config.bucket}"

    def list_backups(self, config: Any) -> list[Any]:
        s3 = self._get_client(config)
        response = s3.list_objects_v2(Bucket=config.bucket)
        if "Contents" not in response:
            return []
        return sorted(
            [
                {
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat(),
                }
                for obj in response["Contents"]
                if obj["Key"].startswith("tasks_") and obj["Key"].endswith(".db")
            ],
            key=lambda x: x["key"],
            reverse=True,
        )

    def download_backup(self, config: Any, key: str, local_dest_path: str) -> str:
        s3 = self._get_client(config)
        s3.download_file(config.bucket, key, local_dest_path)
        return f"Downloaded {key} from {config.bucket}"

    def delete_backup(self, config: Any, key: str) -> str:
        s3 = self._get_client(config)
        s3.delete_object(Bucket=config.bucket, Key=key)
        return f"Deleted {key} from {config.bucket}"
