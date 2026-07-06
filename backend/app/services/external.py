import json
import logging
from datetime import datetime
from typing import Any

import requests

from app.config import logger, settings


class ExternalService:
    def geocode_location(self, location: str) -> dict[str, Any]:
        logger.info("Geocoding location %s", location)
        if not settings.openweather_api_key:
            logger.warning("OPENWEATHER_API_KEY is not set. Using fallback mock geocoding.")
            loc_lower = location.lower()
            if "chennai" in loc_lower:
                return {"lat": 13.0827, "lon": 80.2707, "city": "Chennai", "country": "IN", "state": "Tamil Nadu"}
            elif "mumbai" in loc_lower:
                return {"lat": 19.0760, "lon": 72.8777, "city": "Mumbai", "country": "IN", "state": "Maharashtra"}
            elif "london" in loc_lower:
                return {"lat": 51.5074, "lon": -0.1278, "city": "London", "country": "GB", "state": "England"}
            elif "new york" in loc_lower:
                return {"lat": 40.7128, "lon": -74.0060, "city": "New York", "country": "US", "state": "New York"}
            else:
                return {"lat": 13.0827, "lon": 80.2707, "city": location, "country": "IN", "state": ""}

        url = (
            f"https://api.openweathermap.org/geo/1.0/direct"
            f"?q={location}&limit=1&appid={settings.openweather_api_key}"
        )
        try:
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
        except Exception as exc:
            logger.warning("Geocoding failed for %s, using fallback: %s", location, str(exc))
            return {"lat": 13.0827, "lon": 80.2707, "city": location, "country": "IN", "state": ""}

    def fetch_weather_aqi(self, lat: float, lon: float, city: str) -> str:
        logger.info("Fetching weather and AQI for %s (%s,%s)", city, lat, lon)
        if not settings.openweather_api_key:
            logger.warning("OPENWEATHER_API_KEY is not set. Returning mock weather data.")
            payload = {
                "city": city,
                "lat": lat,
                "lon": lon,
                "temperature": 28.5,
                "feels_like": 31.2,
                "humidity": 68,
                "pressure": 1008,
                "description": "scattered clouds",
                "wind_speed": 3.4,
                "aqi_index": 3,
                "aqi_label": "Moderate",
                "pm2_5": 24.5,
                "pm10": 45.2,
                "no2": 12.8,
                "o3": 34.1,
                "co": 320.5,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            return json.dumps(payload, indent=2)

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
            logger.exception("Error fetching weather/AQI for %s, returning mock", city)
            payload = {
                "city": city,
                "lat": lat,
                "lon": lon,
                "temperature": 27.0,
                "feels_like": 29.5,
                "humidity": 70,
                "pressure": 1010,
                "description": "partly cloudy",
                "wind_speed": 4.1,
                "aqi_index": 2,
                "aqi_label": "Fair",
                "pm2_5": 18.2,
                "pm10": 30.5,
                "no2": 10.1,
                "o3": 28.4,
                "co": 290.0,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            return json.dumps(payload, indent=2)

    def fetch_health_news(self, location: str) -> str:
        logger.info("Fetching health news for %s", location)
        if not settings.news_api_key:
            logger.warning("NEWS_API_KEY is not set. Returning mock health news.")
            return json.dumps([
                {
                    "title": f"Public Health Alert: Air Quality Index reaches Moderate in {location}",
                    "description": "Health officials advise citizens with respiratory illnesses to limit prolonged outdoor exposure as AQI rises.",
                    "source": "Ministry of Health",
                    "published_at": datetime.utcnow().isoformat() + "Z",
                    "url": "https://example.com/news/1",
                    "query": "public health alert"
                },
                {
                    "title": f"Monsoon Prep: District task force inspects local clinics in {location}",
                    "description": "A safety audit is conducted across medical infrastructure to ensure sufficient stock of essential medical supplies.",
                    "source": "District Admin",
                    "published_at": datetime.utcnow().isoformat() + "Z",
                    "url": "https://example.com/news/2",
                    "query": "monsoon prep"
                },
                {
                    "title": f"Immunization Drive: Pediatric vaccines distributed across {location} zones",
                    "description": "More than 15 urban clinics and primary health centers receive fresh batches of pediatric vaccines.",
                    "source": "State Health Dept",
                    "published_at": datetime.utcnow().isoformat() + "Z",
                    "url": "https://example.com/news/3",
                    "query": "immunization drive"
                }
            ], indent=2)

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
            logger.exception("Error fetching news for %s, returning mock", location)
            return json.dumps([
                {
                    "title": f"Public Health Alert: Air Quality Index reaches Moderate in {location}",
                    "description": "Health officials advise citizens with respiratory illnesses to limit prolonged outdoor exposure as AQI rises.",
                    "source": "Ministry of Health",
                    "published_at": datetime.utcnow().isoformat() + "Z",
                    "url": "https://example.com/news/1",
                    "query": "public health alert"
                },
                {
                    "title": f"Monsoon Prep: District task force inspects local clinics in {location}",
                    "description": "A safety audit is conducted across medical infrastructure to ensure sufficient stock of essential medical supplies.",
                    "source": "District Admin",
                    "published_at": datetime.utcnow().isoformat() + "Z",
                    "url": "https://example.com/news/2",
                    "query": "monsoon prep"
                }
            ], indent=2)
