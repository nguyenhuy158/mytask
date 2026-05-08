import pytest

from app.database import connect_db, disconnect_db


@pytest.fixture(autouse=True, scope="function")
async def setup_database():
    await connect_db()
    yield
    await disconnect_db()
