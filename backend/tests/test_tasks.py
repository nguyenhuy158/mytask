import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_read_tasks():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/tasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_create_task():
    task_data = {
        "name": "Test Task",
        "description": "Test Description",
        "task_type": "generic",
        "priority": 1,
    }
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post("/tasks", json=task_data)
    if response.status_code != 200:
        print(f"DEBUG: Status {response.status_code}, Body: {response.text}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Task"
    assert "id" in data
