import logging
import os
from dataclasses import dataclass

import dotenv

dotenv.load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger("health-surveillance")


@dataclass(frozen=True)
class Settings:
    openweather_api_key: str = os.getenv("OPENWEATHER_API_KEY", "")
    news_api_key: str = os.getenv("NEWS_API_KEY", "")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    groq_api_base: str = "https://api.groq.com/openai/v1/chat/completions"
    twilio_account_sid: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_from_number: str = os.getenv("TWILIO_FROM_NUMBER", "")
    twilio_to_number: str = os.getenv("TWILIO_TO_NUMBER", "")


settings = Settings()

if not settings.groq_api_key:
    logger.warning("GROQ_API_KEY is not set. Groq analysis will use fallback responses.")
