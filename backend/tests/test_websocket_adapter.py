import pytest
from unittest.mock import AsyncMock, MagicMock
from app.adapters.driving.websocket_adapter import WebSocketAdapter

@pytest.fixture
def ws_adapter():
    return WebSocketAdapter()

@pytest.mark.asyncio
async def test_connect_disconnect(ws_adapter):
    websocket = AsyncMock()
    await ws_adapter.connect(websocket)
    assert websocket in ws_adapter.active_connections
    
    ws_adapter.disconnect(websocket)
    assert websocket not in ws_adapter.active_connections

@pytest.mark.asyncio
async def test_send_personal_message(ws_adapter):
    websocket = AsyncMock()
    await ws_adapter.send_personal_message("hello", websocket)
    websocket.send_json.assert_called_once_with("hello")

@pytest.mark.asyncio
async def test_broadcast(ws_adapter):
    ws1 = AsyncMock()
    ws2 = AsyncMock()
    await ws_adapter.connect(ws1)
    await ws_adapter.connect(ws2)
    
    await ws_adapter.broadcast({"data": "all"})
    ws1.send_json.assert_called_once_with({"data": "all"})
    ws2.send_json.assert_called_once_with({"data": "all"})

@pytest.mark.asyncio
async def test_broadcast_with_disconnect(ws_adapter):
    ws1 = AsyncMock()
    ws1.send_json.side_effect = Exception("Disconnected")
    await ws_adapter.connect(ws1)
    
    # Should not raise exception, but should remove ws1
    await ws_adapter.broadcast({"data": "all"})
    assert ws1 not in ws_adapter.active_connections
