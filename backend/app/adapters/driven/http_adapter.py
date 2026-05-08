import logging
from datetime import datetime
from typing import Any

import requests

from ...core.ports.external_services import ExternalApiPort, NotificationPort

logger = logging.getLogger(__name__)


class HttpAdapter(ExternalApiPort, NotificationPort):
    def get_weather(self) -> str:
        try:
            response = requests.get(
                "https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current_weather=true"
            )
            weather_data = response.json()
            temperature = weather_data["current_weather"]["temperature"]
            return f"Current temperature in Hanoi: {temperature}°C"
        except Exception as error:
            return f"Weather error: {str(error)}"

    def get_ip(self) -> str:
        try:
            response = requests.get("https://api.ipify.org?format=json")
            return response.json().get("ip", "Unknown")
        except Exception as error:
            return f"IP error: {str(error)}"

    async def send_notification(
        self,
        targets: list[Any],
        title: str,
        message: str,
        level: str = "info",
    ) -> None:
        icon, color = self._get_level_meta(level)

        for target in targets:
            try:
                self._send_to_target(target, title, message, icon, color)
            except Exception as e:
                logger.error(f"Notification failed: {str(e)}")

    def _get_level_meta(self, level: str) -> tuple[str, int]:
        if level == "success":
            return "✅", 3066993
        if level == "warning":
            return "⚠️", 15105570
        if level == "error":
            return "❌", 15158332
        return "ℹ️", 3447003

    def _send_to_target(
        self, target: Any, title: str, message: str, icon: str, color: int
    ):
        t_type = getattr(target, "type", "webhook")
        t_url = getattr(target, "url", getattr(target, "webhook_url", None))
        t_secret = getattr(target, "secret", None)
        t_target = getattr(target, "target", None)

        if t_type == "webhook" and t_url:
            payload = {
                "embeds": [
                    {
                        "title": f"{icon} {title}",
                        "description": message,
                        "color": color,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                ]
            }
            requests.post(t_url, json=payload, timeout=5)
        elif t_type == "telegram":
            self._send_telegram(t_url, t_secret, t_target, title, message, icon)
        elif t_type == "slack" and t_url:
            payload = {"text": f"{icon} *{title}*\n{message}"}
            requests.post(t_url, json=payload, timeout=5)

    def _send_telegram(self, url, secret, target, title, message, icon):
        if secret and target:
            api_url = f"https://api.telegram.org/bot{secret}/sendMessage"
            payload = {
                "chat_id": target,
                "text": f"{icon} *{title}*\n\n{message}",
                "parse_mode": "Markdown",
            }
            requests.post(api_url, json=payload, timeout=5)
        elif url:
            payload = {"text": f"{icon} *{title}*\n\n{message}"}
            requests.post(url, json=payload, timeout=5)
