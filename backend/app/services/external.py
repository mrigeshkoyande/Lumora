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
                "temp_min": w.get("main", {}).get("temp_min"),
                "temp_max": w.get("main", {}).get("temp_max"),
                "humidity": w.get("main", {}).get("humidity"),
                "pressure": w.get("main", {}).get("pressure"),
                "sea_level": w.get("main", {}).get("sea_level"),
                "grnd_level": w.get("main", {}).get("grnd_level"),
                "visibility": w.get("visibility"),
                "description": (w.get("weather") or [{}])[0].get("description"),
                "main_weather": (w.get("weather") or [{}])[0].get("main"),
                "wind_speed": w.get("wind", {}).get("speed"),
                "wind_deg": w.get("wind", {}).get("deg"),
                "wind_gust": w.get("wind", {}).get("gust"),
                "clouds": w.get("clouds", {}).get("all"),
                "rain_1h": w.get("rain", {}).get("1h"),
                "snow_1h": w.get("snow", {}).get("1h"),
                "sunrise": w.get("sys", {}).get("sunrise"),
                "sunset": w.get("sys", {}).get("sunset"),
                "timezone": w.get("timezone"),
                "aqi_index": aqi_index,
                "aqi_label": {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}.get(aqi_index, "N/A"),
                "pm2_5": comp.get("pm2_5"),
                "pm10": comp.get("pm10"),
                "no2": comp.get("no2"),
                "o3": comp.get("o3"),
                "co": comp.get("co"),
                "so2": comp.get("so2"),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            logger.info("Fetched detailed weather/AQI for %s: temp=%s, aqi=%s", city, payload["temperature"], aqi_index)
            return json.dumps(payload, indent=2)
        except Exception as exc:
            logger.exception("Error fetching weather/AQI for %s", city)
            return json.dumps({"error": str(exc)})

    def fetch_weather_forecast(self, lat: float, lon: float, city: str, time_frame: str = "daily") -> str:
        logger.info("Fetching weather forecast for %s (%s,%s) with time_frame=%s", city, lat, lon, time_frame)
        try:
            # Note: The free OpenWeatherMap API mainly provides 5 day / 3 hour forecast.
            # We map 'time_frame' loosely: 'hourly' limits to next 8 periods (24h), 'daily' returns full 5 days.
            resp = requests.get(
                f"https://api.openweathermap.org/data/2.5/forecast"
                f"?lat={lat}&lon={lon}&appid={settings.openweather_api_key}&units=metric",
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            
            forecast_list = data.get("list", [])
            
            if time_frame.lower() == "hourly":
                # Limit to 24 hours (8 entries of 3-hours)
                forecast_list = forecast_list[:8]
            
            processed_forecast = []
            for item in forecast_list:
                processed_forecast.append({
                    "datetime": item.get("dt_txt"),
                    "temperature": item.get("main", {}).get("temp"),
                    "description": (item.get("weather") or [{}])[0].get("description"),
                    "wind_speed": item.get("wind", {}).get("speed"),
                    "rain": item.get("rain", {}).get("3h", 0)
                })

            payload = {
                "city": city,
                "lat": lat,
                "lon": lon,
                "time_frame_requested": time_frame,
                "forecast": processed_forecast,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            return json.dumps(payload, indent=2)
        except Exception as exc:
            logger.exception("Error fetching weather forecast for %s", city)
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
