import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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
        self, webhooks: list[Any], task_name: str, result: Any
    ) -> None:
        for webhook in webhooks:
            try:
                if webhook.type == "webhook":
                    payload = {
                        "embeds": [
                            {
                                "title": f"Task Completed: {task_name}",
                                "description": str(result),
                                "color": 3066993,
                                "timestamp": datetime.utcnow().isoformat(),
                            }
                        ]
                    }
                    requests.post(webhook.url, json=payload, timeout=5)
                elif webhook.type == "telegram":
                    url = f"https://api.telegram.org/bot{webhook.secret}/sendMessage"
                    payload = {
                        "chat_id": webhook.target,
                        "text": f"✅ *Task Completed: {task_name}*\n\n{str(result)}",
                        "parse_mode": "Markdown",
                    }
                    requests.post(url, json=payload, timeout=5)
                elif webhook.type == "slack":
                    if webhook.url:
                        payload = {
                            "text": f"✅ *Task Completed: {task_name}*\n{str(result)}"
                        }
                        requests.post(webhook.url, json=payload, timeout=5)
                    elif webhook.secret and webhook.target:
                        url = "https://slack.com/api/chat.postMessage"
                        headers = {"Authorization": f"Bearer {webhook.secret}"}
                        payload = {
                            "channel": webhook.target,
                            "text": f"✅ *Task Completed: {task_name}*\n{str(result)}",
                        }
                        requests.post(url, headers=headers, json=payload, timeout=5)
                elif webhook.type == "gmail":
                    msg = MIMEMultipart()
                    msg["From"] = webhook.url
                    msg["To"] = webhook.target
                    msg["Subject"] = f"Task Completed: {task_name}"
                    msg.attach(MIMEText(str(result), "plain"))
                    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                        server.login(webhook.url, webhook.secret)
                        server.send_message(msg)
                elif webhook.type == "resend":
                    url = "https://api.resend.com/emails"
                    headers = {
                        "Authorization": f"Bearer {webhook.secret}",
                        "Content-Type": "application/json",
                    }
                    payload = {
                        "from": webhook.url,
                        "to": [webhook.target],
                        "subject": f"Task Completed: {task_name}",
                        "text": str(result),
                    }
                    requests.post(url, headers=headers, json=payload, timeout=5)
            except Exception as e:
                logger.error(f"Notification failed ({webhook.type}): {str(e)}")
