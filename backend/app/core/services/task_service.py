import logging
from datetime import datetime
from typing import Any

from ..entities.models import TaskSchema
from ..ports.external_services import (
    BroadcastPort,
    ExternalApiPort,
    NotificationPort,
    OdooPort,
)
from ..ports.repository import RepositoryPort

logger = logging.getLogger(__name__)


class TaskService:
    def __init__(
        self,
        repository: RepositoryPort,
        external_api: ExternalApiPort,
        notification: NotificationPort,
        broadcast: BroadcastPort,
        odoo_port: OdooPort,
    ):
        self.repository = repository
        self.external_api = external_api
        self.notification = notification
        self.broadcast = broadcast
        self.odoo_port = odoo_port

    async def list_tasks(self) -> list[Any]:
        return await self.repository.get_tasks()

    async def create_task(self, task: TaskSchema) -> Any:
        db_task = await self.repository.create_task(task)
        await self.repository.add_audit_log(
            "TASK_CREATED", f"Task '{db_task.name}' created"
        )
        await self.broadcast.broadcast({"type": "TASK_CREATED", "task": db_task.dict()})
        return db_task

    async def update_task_status(self, task_id: int, status: str) -> Any:
        db_task = await self.repository.update_task_status(task_id, status)

        if status == "done" and db_task.odoo_env_id and db_task.odoo_project_id:
            try:
                env = await self.repository.get_odoo_env_by_id(db_task.odoo_env_id)
                if env:
                    hours = db_task.total_seconds / 3600.0
                    self.odoo_port.create_timesheet(
                        env.url,
                        env.db,
                        env.username,
                        env.password,
                        db_task.odoo_project_id,
                        db_task.odoo_task_id or 0,
                        f"mytask: {db_task.name}",
                        hours,
                    )
                    await self.repository.add_audit_log(
                        "ODOO_SYNC",
                        f"Timesheet created for task '{db_task.name}' ({hours:.2f}h)",
                    )
            except Exception as e:
                logger.error(f"Failed to sync to Odoo: {str(e)}")
                await self.repository.add_audit_log(
                    "ODOO_SYNC_ERROR", f"Failed to sync '{db_task.name}': {str(e)}"
                )

        await self.repository.add_audit_log(
            "TASK_STATUS_UPDATED", f"Task '{db_task.name}' to {status}"
        )
        await self.broadcast.broadcast(
            {"type": "TASK_STATUS_UPDATED", "task_id": task_id, "status": status}
        )
        return db_task

    async def delete_task(self, task_id: int) -> Any:
        db_task = await self.repository.delete_task(task_id)
        await self.repository.add_audit_log(
            "TASK_DELETED", f"Task '{db_task.name}' deleted"
        )
        await self.broadcast.broadcast({"type": "TASK_DELETED", "task_id": task_id})
        return db_task

    async def execute_task(self, task_id: int) -> Any:
        db_task = await self.repository.get_task_by_id(task_id)
        if not db_task:
            return None

        # Dependency Check
        if db_task.dependencies:
            dep_ids = [int(d) for d in db_task.dependencies.split(",") if d.strip()]
            for dep_id in dep_ids:
                dep_task = await self.repository.get_task_by_id(dep_id)
                if dep_task and dep_task.status != "done":
                    await self.broadcast.broadcast(
                        {
                            "type": "TASK_ERROR",
                            "task_id": db_task.id,
                            "message": f"Dependency TASK_{dep_id} is not DONE",
                        }
                    )
                    return {
                        "status": "error",
                        "message": f"Dependency {dep_id} not done",
                    }

        result = (
            self.external_api.get_weather()
            if db_task.task_type == "weather"
            else self.external_api.get_ip()
            if db_task.task_type == "ip"
            else "Unsupported"
        )

        history = await self.repository.create_task_history(
            db_task.id, db_task.name, str(result)
        )

        await self.broadcast.broadcast(
            {
                "type": "TASK_COMPLETED",
                "task_id": db_task.id,
                "result": result,
                "history": {
                    "id": history.id,
                    "task_id": history.task_id,
                    "task_name": history.task_name,
                    "result": history.result,
                    "timestamp": history.timestamp.isoformat(),
                },
            }
        )

        webhooks = await self.repository.get_webhooks(active_only=True)
        await self.notification.send_notification(webhooks, db_task.name, result)
        return result

    async def start_timer(self, task_id: int) -> Any:
        return await self.repository.update_task_timer(
            task_id, timer_started_at=datetime.utcnow()
        )

    async def stop_timer(self, task_id: int) -> Any:
        task = await self.repository.get_task_by_id(task_id)
        if not task or not task.timer_started_at:
            return {"status": "error"}
        delta = datetime.utcnow() - task.timer_started_at
        new_total = task.total_seconds + int(delta.total_seconds())
        await self.repository.update_task_timer(
            task_id, timer_started_at=None, total_seconds=new_total
        )
        return {"status": "success", "total_seconds": new_total}

    async def get_history(self, take: int = 50) -> list[Any]:
        return await self.repository.get_history(take=take)

    async def get_audit_logs(self, take: int = 100) -> list[Any]:
        return await self.repository.get_audit_logs(take=take)

    async def decompose_task(self, task_id: int) -> list[Any]:
        task = await self.repository.get_task_by_id(task_id)
        if not task:
            return []

        desc = task.description.lower()
        subtasks_data = []

        if "refactor" in desc or "implement" in desc:
            subtasks_data = [
                {
                    "name": "Analysis & Planning",
                    "desc": "Analyze existing code and plan the changes.",
                },
                {
                    "name": "Core Implementation",
                    "desc": "Write the main logic and core components.",
                },
                {
                    "name": "Unit Testing",
                    "desc": "Verify the implementation with automated tests.",
                },
                {
                    "name": "Documentation",
                    "desc": "Update documentation and clean up code.",
                },
            ]
        elif "fix" in desc or "bug" in desc:
            subtasks_data = [
                {
                    "name": "Reproduction",
                    "desc": "Create a test case to reproduce the bug.",
                },
                {
                    "name": "Root Cause Analysis",
                    "desc": "Identify why the bug is happening.",
                },
                {
                    "name": "Bug Fix",
                    "desc": "Implement the fix for the identified issue.",
                },
                {
                    "name": "Regression Testing",
                    "desc": "Ensure no other features are broken.",
                },
            ]
        else:
            steps = [s.strip() for s in task.description.split(".") if s.strip()]
            for i, step in enumerate(steps):
                subtasks_data.append({"name": f"Step {i + 1}", "desc": step})

        subtasks = []
        for data in subtasks_data:
            new_task = TaskSchema(
                name=f"{task.name}: {data['name']}",
                description=data["desc"],
                task_type=task.task_type,
                status="todo",
                parent_id=task.id,
                priority=max(1, task.priority - 1),
                project_id=task.project_id,
            )
            sub = await self.repository.create_task(new_task)
            subtasks.append(sub)

        await self.repository.add_audit_log(
            "TASK_DECOMPOSED",
            f"Task {task_id} decomposed into {len(subtasks)} subtasks via AI",
        )
        return subtasks

    async def rank_tasks(self) -> list[Any]:
        tasks = await self.repository.get_tasks()

        def calculate_score(task):
            score = (task.priority or 3) * 10
            if task.deadline:
                days_left = (task.deadline - datetime.utcnow()).days
                score += max(0, 30 - days_left) * 2
            if task.estimated_time:
                score -= task.estimated_time / 60
            return score

        sorted_tasks = sorted(tasks, key=calculate_score, reverse=True)
        return sorted_tasks

    async def create_note(self, note_data: Any) -> Any:
        return await self.repository.create_note(note_data)

    async def list_notes(
        self, task_id: int | None = None, project_id: int | None = None
    ) -> list[Any]:
        return await self.repository.get_notes(task_id, project_id)

    async def get_dependency_graph(self) -> str:
        tasks = await self.repository.get_tasks()
        graph = "TASK DEPENDENCY GRAPH\n"
        graph += "=" * 20 + "\n"

        for task in tasks:
            graph += f"[{task.id}] {task.name}\n"
            if task.dependencies:
                deps = task.dependencies.split(",")
                for dep_id in deps:
                    graph += f" └── depends on: {dep_id}\n"
        return graph
