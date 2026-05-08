from typing import Any

from ..entities.models import OdooEnvSchema
from ..ports.external_services import OdooPort
from ..ports.repository import RepositoryPort


class OdooService:
    def __init__(self, repository: RepositoryPort, odoo_port: OdooPort):
        self.repository = repository
        self.odoo_port = odoo_port

    async def list_envs(self) -> list[Any]:
        return await self.repository.get_odoo_envs()

    async def create_env(self, env: OdooEnvSchema) -> Any:
        return await self.repository.create_odoo_env(env)

    async def import_envs(self, envs: list[OdooEnvSchema]) -> list[Any]:
        results = []
        for env in envs:
            results.append(await self.repository.create_odoo_env(env))
        return results

    async def delete_env(self, env_id: int) -> Any:
        return await self.repository.delete_odoo_env(env_id)

    async def duplicate_env(self, env_id: int) -> Any:
        env = await self.repository.get_odoo_env_by_id(env_id)
        if not env:
            raise Exception("Environment not found")

        new_env = OdooEnvSchema(
            name=f"{env.name} (Copy)",
            url=env.url,
            db=env.db,
            username=env.username,
            password=env.password,
            color=env.color,
        )
        return await self.repository.create_odoo_env(new_env)

    async def update_env(self, env_id: int, data: dict) -> Any:
        return await self.repository.update_odoo_env(env_id, data)

    async def test_connection(self, env_id: int) -> bool:
        env = await self.repository.get_odoo_env_by_id(env_id)
        if not env:
            raise Exception("Environment not found")
        return self.odoo_port.test_connection(
            env.url, env.db, env.username, env.password
        )

    async def test_connection_raw(self, env: OdooEnvSchema) -> bool:
        return self.odoo_port.test_connection(
            env.url, env.db, env.username, env.password
        )

    async def get_crons(self, env_id: int) -> list[Any]:
        env = await self.repository.get_odoo_env_by_id(env_id)
        if not env:
            raise Exception("Environment not found")
        crons = self.odoo_port.get_crons(env.url, env.db, env.username, env.password)
        for cron in crons:
            if not isinstance(cron.get("interval_type"), str):
                cron["interval_type"] = str(cron.get("interval_type") or "")

            # Handle model_id (many2one returns [id, name])
            model_id = cron.get("model_id")
            if isinstance(model_id, (list, tuple)) and len(model_id) > 1:
                cron["model"] = model_id[1]
            else:
                cron["model"] = ""
        return crons

    async def toggle_cron(self, env_id: int, cron_id: int, active: bool) -> Any:
        env = await self.repository.get_odoo_env_by_id(env_id)
        if not env:
            raise Exception("Environment not found")
        return self.odoo_port.toggle_cron(
            env.url, env.db, env.username, env.password, cron_id, active
        )

    async def run_cron(self, env_id: int, cron_id: int) -> Any:
        env = await self.repository.get_odoo_env_by_id(env_id)
        if not env:
            raise Exception("Environment not found")
        return self.odoo_port.run_cron(
            env.url, env.db, env.username, env.password, cron_id
        )

    async def execute_remote_shell(self, env_id: int, script: str) -> Any:
        env = await self.repository.get_odoo_env_by_id(env_id)
        if not env:
            raise Exception("Environment not found")
        return self.odoo_port.execute_script(
            env.url, env.db, env.username, env.password, script
        )

    async def get_disbursement_report(self, env_id: int) -> list[Any]:
        env = await self.repository.get_odoo_env_by_id(env_id)
        if not env:
            raise Exception("Environment not found")
        return self.odoo_port.get_disbursement_report(
            env.url, env.db, env.username, env.password
        )
