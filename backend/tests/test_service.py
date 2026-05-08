from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.entities.models import TaskSchema
from app.core.services.task_service import TaskService


@pytest.mark.asyncio
async def test_task_service_create_task():
    repo = MagicMock()
    repo.create_task = AsyncMock(return_value=MagicMock(id=1, name="Mock Task"))
    repo.add_audit_log = AsyncMock()

    api = MagicMock()
    notif = MagicMock()
    broadcast = MagicMock()
    broadcast.broadcast = AsyncMock()
    odoo = MagicMock()

    service = TaskService(repo, api, notif, broadcast, odoo)
    task = TaskSchema(name="Mock Task", description="Desc", task_type="generic")

    result = await service.create_task(task)

    assert result.id == 1
    repo.create_task.assert_called_once()
    repo.add_audit_log.assert_called_once()
    broadcast.broadcast.assert_called_once()
