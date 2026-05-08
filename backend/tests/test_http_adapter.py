import pytest
from unittest.mock import patch, MagicMock
from app.adapters.driven.http_adapter import HttpAdapter

@pytest.fixture
def http_adapter():
    return HttpAdapter()

def test_get_weather_success(http_adapter):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "current_weather": {"temperature": 25.5}
    }
    with patch("requests.get", return_value=mock_response):
        result = http_adapter.get_weather()
        assert result == "Current temperature in Hanoi: 25.5°C"

def test_get_weather_failure(http_adapter):
    with patch("requests.get", side_effect=Exception("Network error")):
        result = http_adapter.get_weather()
        assert "Weather error: Network error" in result

def test_get_ip_success(http_adapter):
    mock_response = MagicMock()
    mock_response.json.return_value = {"ip": "1.2.3.4"}
    with patch("requests.get", return_value=mock_response):
        result = http_adapter.get_ip()
        assert result == "1.2.3.4"

def test_get_ip_failure(http_adapter):
    with patch("requests.get", side_effect=Exception("IP error")):
        result = http_adapter.get_ip()
        assert "IP error: IP error" in result

@pytest.mark.asyncio
async def test_send_notification_webhook(http_adapter):
    target = MagicMock()
    target.type = "webhook"
    target.url = "http://webhook.url"
    
    with patch("requests.post") as mock_post:
        await http_adapter.send_notification([target], "Title", "Message")
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert kwargs["json"]["embeds"][0]["title"] == "ℹ️ Title"
        assert kwargs["json"]["embeds"][0]["description"] == "Message"

@pytest.mark.asyncio
async def test_send_notification_telegram(http_adapter):
    target = MagicMock()
    target.type = "telegram"
    target.secret = "bot_token"
    target.target = "chat_id"
    
    with patch("requests.post") as mock_post:
        await http_adapter.send_notification([target], "Title", "Message", level="success")
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert "bot_token" in args[0]
        assert kwargs["json"]["chat_id"] == "chat_id"
        assert "Title" in kwargs["json"]["text"]
        assert "✅" in kwargs["json"]["text"]

@pytest.mark.asyncio
async def test_send_notification_slack(http_adapter):
    target = MagicMock()
    target.type = "slack"
    target.url = "http://slack.url"
    
    with patch("requests.post") as mock_post:
        await http_adapter.send_notification([target], "Title", "Message", level="error")
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == "http://slack.url"
        assert "❌ *Title*" in kwargs["json"]["text"]

@pytest.mark.asyncio
async def test_send_notification_warning(http_adapter):
    target = MagicMock()
    target.type = "webhook"
    target.url = "http://webhook.url"
    
    with patch("requests.post") as mock_post:
        await http_adapter.send_notification([target], "Title", "Message", level="warning")
        mock_post.assert_called_once()
        assert "⚠️ Title" in mock_post.call_args[1]["json"]["embeds"][0]["title"]

@pytest.mark.asyncio
async def test_send_notification_exception_handling(http_adapter):
    target = MagicMock()
    target.type = "webhook"
    target.url = "http://webhook.url"
    
    with patch("requests.post", side_effect=Exception("Post failed")):
        # Should not raise exception
        await http_adapter.send_notification([target], "Title", "Message")

def test_send_telegram_with_url(http_adapter):
    with patch("requests.post") as mock_post:
        http_adapter._send_telegram("http://telegram.url", None, None, "Title", "Message", "ℹ️")
        mock_post.assert_called_once_with(
            "http://telegram.url", 
            json={"text": "ℹ️ *Title*\n\nMessage"},
            timeout=5
        )
