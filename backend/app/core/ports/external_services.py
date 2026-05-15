from abc import ABC, abstractmethod
from typing import Any


class NotificationPort(ABC):
    @abstractmethod
    async def send_notification(
        self,
        targets: list[Any],
        title: str,
        message: str,
        level: str = "info",  # info, success, warning, error
    ) -> None:
        pass


class ExternalApiPort(ABC):
    @abstractmethod
    def get_weather(self) -> str:
        pass

    @abstractmethod
    def get_ip(self) -> str:
        pass


class StoragePort(ABC):
    @abstractmethod
    def backup_sqlite_db(self) -> str:
        pass

    @abstractmethod
    def upload_file(
        self, config: Any, local_file_path: str, key: str
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def get_signed_url(self, config: Any, key: str, expires_in: int = 3600) -> str:
        pass

    @abstractmethod
    def list_files(self, config: Any, prefix: str = "") -> list[Any]:
        pass

    @abstractmethod
    def delete_file(self, config: Any, key: str) -> str:
        pass

    @abstractmethod
    def upload_backup(self, config: Any, local_file_path: str) -> str:
        pass

    @abstractmethod
    def list_backups(self, config: Any) -> list[Any]:
        pass

    @abstractmethod
    def download_backup(self, config: Any, key: str, local_dest_path: str) -> str:
        pass

    @abstractmethod
    def delete_backup(self, config: Any, key: str) -> str:
        pass


class OdooPort(ABC):
    @abstractmethod
    def test_connection(self, url: str, db: str, username: str, password: str) -> bool:
        pass

    @abstractmethod
    def get_crons(self, url: str, db: str, username: str, password: str) -> list[Any]:
        pass

    @abstractmethod
    def toggle_cron(
        self,
        url: str,
        db: str,
        username: str,
        password: str,
        cron_id: int,
        active: bool,
    ) -> Any:
        pass

    @abstractmethod
    def run_cron(
        self, url: str, db: str, username: str, password: str, cron_id: int
    ) -> Any:
        pass

    @abstractmethod
    def execute_script(
        self, url: str, db: str, username: str, password: str, script: str
    ) -> Any:
        pass

    @abstractmethod
    def create_timesheet(
        self,
        url: str,
        db: str,
        username: str,
        password: str,
        project_id: int,
        task_id: int,
        name: str,
        hours: float,
    ) -> int:
        pass

    @abstractmethod
    def get_disbursement_report(
        self, url: str, db: str, username: str, password: str
    ) -> list[Any]:
        pass

    @abstractmethod
    def get_oauth_providers(
        self, url: str, db: str, username: str, password: str
    ) -> list[Any]:
        pass

    @abstractmethod
    def update_oauth_provider(
        self,
        url: str,
        db: str,
        username: str,
        password: str,
        provider_id: int,
        values: dict,
    ) -> Any:
        pass


class BroadcastPort(ABC):
    @abstractmethod
    async def broadcast(self, message: dict) -> None:
        pass
