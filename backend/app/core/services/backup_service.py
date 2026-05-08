import logging
import os
import shutil
from typing import Any

from ..ports.external_services import StoragePort
from ..ports.repository import RepositoryPort

logger = logging.getLogger(__name__)


class BackupService:
    def __init__(self, repository: RepositoryPort, storage: StoragePort):
        self.repository = repository
        self.storage = storage

    async def run_backup_job(self) -> str:
        local_result = self.storage.backup_sqlite_db()
        logger.info(f"Local backup: {local_result}")

        if "Backup created:" not in local_result:
            return local_result

        local_path = local_result.split(": ")[1]

        # Check for default S3 target
        config = await self.repository.get_system_config("default_backup_target")
        if config and config.value.startswith("s3:"):
            try:
                s3_id = int(config.value.split(":")[1])
                s3_config = await self.repository.get_s3_config_by_id(s3_id)
                if s3_config:
                    s3_result = self.storage.upload_backup(s3_config, local_path)
                    logger.info(f"S3 backup: {s3_result}")
            except Exception as e:
                logger.error(f"Failed to upload scheduled backup to S3: {e}")

        return local_result

    async def list_local_backups(self) -> list[str]:
        if not os.path.exists("backups"):
            return []
        return sorted(
            [f for f in os.listdir("backups") if f.startswith("tasks_")], reverse=True
        )

    async def get_backup_cron(self) -> str:
        config = await self.repository.get_system_config("backup_cron")
        return config.value if config else "0 * * * *"

    async def update_backup_cron(self, cron: str) -> None:
        await self.repository.upsert_system_config("backup_cron", cron)

    async def get_default_backup_target(self) -> str:
        config = await self.repository.get_system_config("default_backup_target")
        return config.value if config else "local"

    async def update_default_backup_target(self, target: str) -> None:
        await self.repository.upsert_system_config("default_backup_target", target)

    async def list_s3_backups(self, config_id: int) -> list[Any]:
        config = await self.repository.get_s3_config_by_id(config_id)
        if not config:
            raise Exception("S3 configuration not found")
        return self.storage.list_backups(config)

    async def backup_to_s3(self, config_id: int) -> str:
        config = await self.repository.get_s3_config_by_id(config_id)
        if not config:
            raise Exception("S3 configuration not found")

        local_result = self.storage.backup_sqlite_db()
        if "Backup created:" not in local_result:
            raise Exception(local_result)

        local_path = local_result.split(": ")[1]
        return self.storage.upload_backup(config, local_path)

    async def restore_from_s3(
        self, config_id: int, key: str, disconnect_db_func, connect_db_func
    ) -> str:
        config = await self.repository.get_s3_config_by_id(config_id)
        if not config:
            raise Exception("S3 configuration not found")

        local_path = f"backups/restore_{key}"
        self.storage.download_backup(config, key, local_path)

        await disconnect_db_func()
        shutil.copy2(local_path, "tasks.db")
        await connect_db_func()

        return f"Restored from {key}"

    async def restore_local_backup(
        self, filename: str, disconnect_db_func, connect_db_func
    ) -> str:
        local_path = os.path.join("backups", filename)
        if not os.path.exists(local_path):
            raise Exception("Backup file not found")

        await disconnect_db_func()
        shutil.copy2(local_path, "tasks.db")
        await connect_db_func()

        return f"Restored from {filename}"

    async def delete_local_backup(self, filename: str) -> None:
        local_path = os.path.join("backups", filename)
        if os.path.exists(local_path):
            os.remove(local_path)

    async def delete_s3_backup(self, config_id: int, key: str) -> str:
        config = await self.repository.get_s3_config_by_id(config_id)
        if not config:
            raise Exception("S3 configuration not found")
        return self.storage.delete_backup(config, key)
