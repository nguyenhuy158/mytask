from unittest.mock import MagicMock, patch

import pytest

from app.adapters.driving.rpc_adapter import (
    get_history_rpc,
    handle_rpc_request,
    list_tasks_rpc,
    run_task_rpc,
)


def test_handle_rpc_request():
    with patch(
        "app.adapters.driving.rpc_adapter.dispatcher._marshaled_dispatch"
    ) as mock_dispatch:
        mock_post_data = "data"
        mock_dispatch.return_value = "response"
        result = handle_rpc_request(mock_post_data)
        assert result == "response"


@pytest.mark.asyncio
async def test_list_tasks_rpc():
    with (
        patch("app.adapters.driving.rpc_adapter.get_task_service") as mock_get_service,
        patch("app.adapters.driving.rpc_adapter.connect_db", new_callable=MagicMock),
    ):
        mock_service = mock_get_service.return_value
        mock_service.list_tasks.return_value = [
            MagicMock(id=1, name="T", task_type="manual", status="todo")
        ]
        with patch("app.adapters.driving.rpc_adapter.run_async") as mock_run:
            mock_run.return_value = [{"id": 1}]
            result = list_tasks_rpc()
            assert result == [{"id": 1}]


def test_run_task_rpc():
    with patch("app.adapters.driving.rpc_adapter.run_async") as mock_run:
        mock_run.return_value = {"status": "success"}
        result = run_task_rpc(1)
        assert result["status"] == "success"


def test_get_history_rpc():
    with patch("app.adapters.driving.rpc_adapter.run_async") as mock_run:
        mock_run.return_value = []
        result = get_history_rpc()
        assert result == []
