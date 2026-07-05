import json
import logging
from datetime import datetime
from typing import Any

import requests

from app.config import logger, settings


class ExternalService:
    def geocode_location(self, location: str) -> dict[str, Any]:
        url = (
            f"https://api.openweathermap.org/geo/1.0/direct"
            f"?q={location}&limit=1&appid={settings.openweather_api_key}"
        )
        logger.info("Geocoding location %s", location)
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            logger.warning("Geocoding returned no data for %s", location)
            raise ValueError(f"Location '{location}' not found.")
        return {
            "lat": data[0]["lat"],
            "lon": data[0]["lon"],
            "city": data[0].get("name", location),
            "country": data[0].get("country", ""),
            "state": data[0].get("state", ""),
        }

    def fetch_weather_aqi(self, lat: float, lon: float, city: str) -> str:
        logger.info("Fetching weather and AQI for %s (%s,%s)", city, lat, lon)
        try:
            w_resp = requests.get(
                f"https://api.openweathermap.org/data/2.5/weather"
                f"?lat={lat}&lon={lon}&appid={settings.openweather_api_key}&units=metric",
                timeout=10,
            )
            w_resp.raise_for_status()
            w = w_resp.json()

            a_resp = requests.get(
                f"https://api.openweathermap.org/data/2.5/air_pollution"
                f"?lat={lat}&lon={lon}&appid={settings.openweather_api_key}",
                timeout=10,
            )
            a_resp.raise_for_status()
            a = a_resp.json()

            comp = {}
            aqi_index = "N/A"
            if "list" in a and a["list"]:
                aqi_index = a["list"][0]["main"]["aqi"]
                comp = a["list"][0].get("components", {})

            payload = {
                "city": city,
                "lat": lat,
                "lon": lon,
                "temperature": w.get("main", {}).get("temp"),
                "feels_like": w.get("main", {}).get("feels_like"),
                "humidity": w.get("main", {}).get("humidity"),
                "pressure": w.get("main", {}).get("pressure"),
                "description": (w.get("weather") or [{}])[0].get("description"),
                "wind_speed": w.get("wind", {}).get("speed"),
                "aqi_index": aqi_index,
                "aqi_label": {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}.get(aqi_index, "N/A"),
                "pm2_5": comp.get("pm2_5"),
                "pm10": comp.get("pm10"),
                "no2": comp.get("no2"),
                "o3": comp.get("o3"),
                "co": comp.get("co"),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            logger.info("Fetched weather/AQI for %s: temp=%s, aqi=%s", city, payload["temperature"], aqi_index)
            return json.dumps(payload, indent=2)
        except Exception as exc:
            logger.exception("Error fetching weather/AQI for %s", city)
            return json.dumps({"error": str(exc)})

    def fetch_health_news(self, location: str) -> str:
        logger.info("Fetching health news for %s", location)
        try:
            queries = [
                f"disease outbreak {location}",
                f"respiratory illness {location}",
                f"public health alert {location}",
                f"festivals and events {location}",
                f"weather alerts {location}"
            ]
            all_articles = []
            for q in queries:
                resp = requests.get(
                    f"https://newsapi.org/v2/everything"
                    f"?q={q}&language=en&sortBy=publishedAt&pageSize=5"
                    f"&apiKey={settings.news_api_key}",
                    timeout=10,
                )
                resp.raise_for_status()
                data = resp.json()
                for article in data.get("articles", [])[:3]:
                    all_articles.append({
                        "title": article.get("title"),
                        "description": article.get("description"),
                        "source": article.get("source", {}).get("name"),
                        "published_at": article.get("publishedAt"),
                        "url": article.get("url"),
                        "query": q,
                    })
            logger.info("Fetched %d news articles for %s", len(all_articles), location)
            return json.dumps(all_articles, indent=2)
        except Exception as exc:
            logger.exception("Error fetching news for %s", location)
            return json.dumps({"error": str(exc)})
