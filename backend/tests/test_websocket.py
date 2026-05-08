from fastapi.testclient import TestClient

from app.main import app


def test_websocket():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        websocket.send_text("Hello")
        # Just connecting and sending covers the endpoint and adapter connect
