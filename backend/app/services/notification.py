import requests
from requests.auth import HTTPBasicAuth

from app.config import logger, settings


class NotificationService:
    def __init__(self):
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token
        self.from_number = settings.twilio_from_number
        self.to_number = settings.twilio_to_number

    def is_configured(self) -> bool:
        return bool(self.account_sid and self.auth_token and self.from_number and self.to_number)

    def send_sms(self, to: str, body: str) -> dict:
        if not self.is_configured():
            logger.warning("Twilio is not configured. Cannot send SMS.")
            return {"error": "Twilio not configured"}

        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        
        payload = {
            "To": to,
            "From": self.from_number,
            "Body": body,
        }
        
        logger.info(f"Sending SMS via Twilio to {to}")
        try:
            response = requests.post(
                url,
                data=payload,
                auth=HTTPBasicAuth(self.account_sid, self.auth_token),
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            logger.info(f"SMS sent successfully. SID: {data.get('sid')}")
            return data
        except requests.exceptions.RequestException as exc:
            logger.exception("Failed to send Twilio SMS")
            return {"error": str(exc)}

    def dispatch_alert(self, report: dict) -> dict:
        """Formats the AI report and sends it as an SMS to the default doctor."""
        location = report.get("location", "Unknown Location")
        if isinstance(location, dict):
            location = location.get("city", "Unknown Location")

        risk_level = report.get("overall_risk_level", "Unknown").upper()
        actions = report.get("recommended_actions", [])
        action_text = "\n".join([f"- {a}" for a in actions[:3]]) # Send top 3 actions

        body = (
            f"🚨 URGENT: Health Alert ({location})\n"
            f"Risk Level: {risk_level}\n\n"
            f"Required Actions:\n{action_text}\n\n"
            f"See dashboard for details."
        )

        return self.send_sms(to=self.to_number, body=body)
