import pytest
from unittest.mock import MagicMock, AsyncMock
from app.core.services.odoo_service import OdooService
from app.core.entities.models import OdooEnvSchema

@pytest.fixture
def mock_odoo_adapter():
    return MagicMock()

@pytest.fixture
def mock_prisma_adapter():
    mock = MagicMock()
    mock.get_odoo_env_by_id = AsyncMock()
    mock.get_odoo_envs = AsyncMock()
    mock.get_default_odoo_env = AsyncMock()
    mock.create_odoo_env = AsyncMock()
    mock.delete_odoo_env = AsyncMock()
    mock.update_odoo_env = AsyncMock()
    mock.set_odoo_env_default = AsyncMock()
    return mock

@pytest.fixture
def odoo_service(mock_odoo_adapter, mock_prisma_adapter):
    return OdooService(mock_prisma_adapter, mock_odoo_adapter)

@pytest.mark.asyncio
async def test_get_crons(odoo_service, mock_odoo_adapter, mock_prisma_adapter):
    mock_env = MagicMock(id=1, url="url", db="db", username="u", password="p")
    mock_prisma_adapter.get_odoo_env_by_id.return_value = mock_env
    mock_odoo_adapter.get_crons.return_value = [
        {"name": "Cron 1", "interval_type": "hours", "model_id": [1, "sale.order"]}
    ]
    
    result = await odoo_service.get_crons(1)
    assert len(result) == 1
    assert result[0]["name"] == "Cron 1"

@pytest.mark.asyncio
async def test_list_envs(odoo_service, mock_prisma_adapter):
    mock_prisma_adapter.get_odoo_envs.return_value = [{"id": 1, "name": "Env 1"}]
    result = await odoo_service.list_envs()
    assert result == [{"id": 1, "name": "Env 1"}]

@pytest.mark.asyncio
async def test_toggle_cron(odoo_service, mock_odoo_adapter, mock_prisma_adapter):
    mock_env = MagicMock(id=1, url="url", db="db", username="u", password="p")
    mock_prisma_adapter.get_odoo_env_by_id.return_value = mock_env
    
    await odoo_service.toggle_cron(1, 123, True)
    mock_odoo_adapter.toggle_cron.assert_called_once()

@pytest.mark.asyncio
async def test_get_disbursement_report(odoo_service, mock_odoo_adapter, mock_prisma_adapter):
    mock_env = MagicMock(id=1, url="url", db="db", username="u", password="p")
    mock_prisma_adapter.get_odoo_env_by_id.return_value = mock_env
    mock_odoo_adapter.get_disbursement_report.return_value = []
    
    result = await odoo_service.get_disbursement_report(1)
    assert result == []

@pytest.mark.asyncio
async def test_duplicate_env(odoo_service, mock_prisma_adapter):
    mock_env = MagicMock(spec=OdooEnvSchema)
    mock_env.name = "Dev"
    mock_env.url = "url"
    mock_env.db = "db"
    mock_env.username = "u"
    mock_env.password = "p"
    mock_env.color = "blue"
    
    mock_prisma_adapter.get_odoo_env_by_id.return_value = mock_env
    mock_prisma_adapter.create_odoo_env.return_value = MagicMock(id=2)
    
    result = await odoo_service.duplicate_env(1)
    mock_prisma_adapter.create_odoo_env.assert_called_once()
    new_env = mock_prisma_adapter.create_odoo_env.call_args[0][0]
    assert new_env.name == "Dev (Copy)"
