from fastapi import WebSocket

from ...core.ports.external_services import BroadcastPort


class WebSocketAdapter(BroadcastPort):
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        active = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
                active.append(connection)
            except Exception:
                continue
        self.active_connections = active
