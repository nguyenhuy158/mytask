import pytest
from unittest.mock import MagicMock, AsyncMock
from app.core.services.odoo_service import OdooService
from app.core.entities.models import OdooEnvSchema

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def mock_odoo_port():
    return MagicMock()

@pytest.fixture
def odoo_service(mock_repo, mock_odoo_port):
    return OdooService(repository=mock_repo, odoo_port=mock_odoo_port)

@pytest.mark.asyncio
async def test_list_envs(odoo_service, mock_repo):
    mock_repo.get_odoo_envs.return_value = []
    envs = await odoo_service.list_envs()
    assert envs == []
    mock_repo.get_odoo_envs.assert_called_once()

@pytest.mark.asyncio
async def test_duplicate_env(odoo_service, mock_repo):
    original_env = MagicMock(id=1, url="http://test", db="db", username="u", password="p", color="blue")
    original_env.name = "Original" # Set string directly
    mock_repo.get_odoo_env_by_id.return_value = original_env
    
    await odoo_service.duplicate_env(1)
    
    mock_repo.create_odoo_env.assert_called_once()
    new_env = mock_repo.create_odoo_env.call_args[0][0]
    assert "Original (Copy)" == new_env.name

@pytest.mark.asyncio
async def test_test_connection(odoo_service, mock_repo, mock_odoo_port):
    env = MagicMock(url="u", db="d", username="un", password="pw")
    mock_repo.get_odoo_env_by_id.return_value = env
    mock_odoo_port.test_connection.return_value = True
    
    result = await odoo_service.test_connection(1)
    assert result is True
    mock_odoo_port.test_connection.assert_called_once()

@pytest.mark.asyncio
async def test_get_crons(odoo_service, mock_repo, mock_odoo_port):
    env = MagicMock(url="u", db="d", username="un", password="pw")
    mock_repo.get_odoo_env_by_id.return_value = env
    mock_odoo_port.get_crons.return_value = [
        {"name": "Cron 1", "interval_type": "hours", "model_id": [1, "sale.order"]}
    ]
    
    crons = await odoo_service.get_crons(1)
    assert len(crons) == 1
    assert crons[0]["model"] == "sale.order"

@pytest.mark.asyncio
async def test_toggle_cron(odoo_service, mock_repo, mock_odoo_port):
    env = MagicMock(url="u", db="d", username="un", password="pw")
    mock_repo.get_odoo_env_by_id.return_value = env
    
    await odoo_service.toggle_cron(1, 10, True)
    mock_odoo_port.toggle_cron.assert_called_once_with("u", "d", "un", "pw", 10, True)

@pytest.mark.asyncio
async def test_execute_remote_shell(odoo_service, mock_repo, mock_odoo_port):
    env = MagicMock(url="u", db="d", username="un", password="pw")
    mock_repo.get_odoo_env_by_id.return_value = env
    
    await odoo_service.execute_remote_shell(1, "print('hello')")
    mock_odoo_port.execute_script.assert_called_once()
