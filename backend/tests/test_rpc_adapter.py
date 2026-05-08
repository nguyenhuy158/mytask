import pytest
from unittest.mock import patch, MagicMock
from app.adapters.driving.rpc_adapter import (
    handle_rpc_request, 
    list_tasks_rpc, 
    run_task_rpc, 
    get_history_rpc
)

def test_handle_rpc_request():
    xml_request = '<?xml version="1.0"?><methodCall><methodName>tasks.list</methodName><params></params></methodCall>'
    with patch("app.adapters.driving.rpc_adapter.dispatcher._marshaled_dispatch") as mock_dispatch:
        mock_dispatch.return_value = "methodResponse"
        response = handle_rpc_request(xml_request.encode())
        assert "methodResponse" in response

@pytest.mark.asyncio
async def test_list_tasks_rpc():
    with patch("app.adapters.driving.rpc_adapter.task_service.list_tasks", new_callable=MagicMock) as mock_list, \
         patch("app.adapters.driving.rpc_adapter.connect_db", new_callable=MagicMock):
        mock_list.return_value = [MagicMock(id=1, name="T", task_type="manual", status="todo")]
        # Since list_tasks_rpc calls run_async which creates a new loop, 
        # it's tricky to mock in some environments, but let's try.
        # We need to mock the async part inside list_tasks_rpc.
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
