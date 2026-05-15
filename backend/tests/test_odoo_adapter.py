from unittest.mock import MagicMock, patch

import pytest

from app.adapters.driven.odoo_adapter import OdooAdapter


@pytest.fixture
def odoo_adapter():
    return OdooAdapter()


@pytest.fixture
def mock_server_proxy():
    with patch("xmlrpc.client.ServerProxy") as mock:
        yield mock


def test_test_connection_success(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_server_proxy.return_value = mock_common

    result = odoo_adapter.test_connection("url", "db", "user", "pass")
    assert result is True


def test_test_connection_failure(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = False
    mock_server_proxy.return_value = mock_common

    result = odoo_adapter.test_connection("url", "db", "user", "pass")
    assert result is False


def test_get_crons(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.return_value = [{"name": "Cron 1"}]

    # First call returns common, second returns models
    mock_server_proxy.side_effect = [mock_common, mock_models]

    result = odoo_adapter.get_crons("url", "db", "user", "pass")
    assert len(result) == 1
    assert result[0]["name"] == "Cron 1"


def test_toggle_cron(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.return_value = True
    mock_server_proxy.side_effect = [mock_common, mock_models]

    result = odoo_adapter.toggle_cron("url", "db", "user", "pass", 123, True)
    assert result is True
    mock_models.execute_kw.assert_called_with(
        "db", 1, "pass", "ir.cron", "write", [[123], {"active": True}]
    )


def test_run_cron(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_server_proxy.side_effect = [mock_common, mock_models]

    odoo_adapter.run_cron("url", "db", "user", "pass", 123)
    mock_models.execute_kw.assert_called_with(
        "db", 1, "pass", "ir.cron", "method_direct_trigger", [[123]]
    )


def test_execute_script_success(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.return_value = "Result"
    mock_server_proxy.side_effect = [mock_common, mock_models]

    # script format: model|method|args|kwargs
    script = "res.users|search|[[]]|{}"
    result = odoo_adapter.execute_script("url", "db", "user", "pass", script)
    assert result == "Result"


def test_execute_script_failure(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_server_proxy.return_value = mock_common  # auth fails later or something

    result = odoo_adapter.execute_script("url", "db", "user", "pass", "invalid_script")
    assert "Error executing Odoo script" in result


def test_create_timesheet(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.return_value = 456
    mock_server_proxy.side_effect = [mock_common, mock_models]

    result = odoo_adapter.create_timesheet(
        "url", "db", "user", "pass", 1, 2, "Task", 1.5
    )
    assert result == 456


def test_get_disbursement_report_success(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.return_value = [
        {
            "id": 1,
            "confirm_date": "2023-01-01 10:00:00",
            "approve_date": "2023-01-01 10:30:00",
        }
    ]
    mock_server_proxy.side_effect = [mock_common, mock_models]

    result = odoo_adapter.get_disbursement_report("url", "db", "user", "pass")
    assert len(result) == 1
    assert result[0]["approval_duration"] == 30.0


def test_get_disbursement_report_not_found(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.side_effect = Exception(
        "Object sale.disbursement doesn't exist"
    )
    mock_server_proxy.side_effect = [mock_common, mock_models]

    result = odoo_adapter.get_disbursement_report("url", "db", "user", "pass")
    assert result == []


def test_get_disbursement_report_auth_failure(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = False
    mock_server_proxy.return_value = mock_common

    with pytest.raises(Exception, match="Authentication failed"):
        odoo_adapter.get_disbursement_report("url", "db", "user", "pass")


def test_get_oauth_providers(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.return_value = [
        {"id": 1, "name": "Google OAuth2", "client_id": "abc", "enabled": True}
    ]
    mock_server_proxy.side_effect = [mock_common, mock_models]

    result = odoo_adapter.get_oauth_providers("url", "db", "user", "pass")
    assert len(result) == 1
    assert result[0]["name"] == "Google OAuth2"
    args, _ = mock_models.execute_kw.call_args
    assert args[3] == "auth.oauth.provider"
    assert args[4] == "search_read"


def test_update_oauth_provider(odoo_adapter, mock_server_proxy):
    mock_common = MagicMock()
    mock_common.authenticate.return_value = 1
    mock_models = MagicMock()
    mock_models.execute_kw.return_value = True
    mock_server_proxy.side_effect = [mock_common, mock_models]

    result = odoo_adapter.update_oauth_provider(
        "url", "db", "user", "pass", 5, {"client_id": "new-id", "enabled": False}
    )
    assert result is True
    mock_models.execute_kw.assert_called_with(
        "db",
        1,
        "pass",
        "auth.oauth.provider",
        "write",
        [[5], {"client_id": "new-id", "enabled": False}],
    )
