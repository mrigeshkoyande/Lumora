import json
import os
import csv
from datetime import datetime
from typing import Any

import requests

from app.config import logger, settings
from app.services.external import ExternalService


class AnalysisService:
    def __init__(self, external_service: ExternalService | None = None):
        self.external_service = external_service or ExternalService()

    def build_analysis_context(self, lat: float, lon: float, city: str) -> str:
        weather_payload = json.loads(self.external_service.fetch_weather_aqi(lat, lon, city))
        news_payload = json.loads(self.external_service.fetch_health_news(city))

        compact_weather = {
            "city": weather_payload.get("city"),
            "temp": weather_payload.get("temperature"),
            "humidity": weather_payload.get("humidity"),
            "desc": weather_payload.get("description"),
            "aqi": weather_payload.get("aqi_index"),
            "aqi_label": weather_payload.get("aqi_label"),
        }

        compact_news = []
        for item in news_payload[:1]:
            if isinstance(item, dict):
                compact_news.append({
                    "title": item.get("title"),
                    "source": item.get("source"),
                })

        # Load hospital data without hardcoding 'Chennai'
        hospital_data = []
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "D60. Zonewise Hospital Coverage.csv")
        try:
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    hospital_data.append({
                        "zone": row.get("Zone Name", "").strip(),
                        "hospitals": row.get("No.of Hospitals/Nursing Homes"),
                        "beds": row.get("No.of beds"),
                        "stock_availability_percent": row.get("Medicinal Stocks Availability (%)")
                    })
        except Exception as e:
            logger.warning(f"Could not load hospital dataset: {e}")

        return json.dumps({
            "weather": compact_weather, 
            "news": compact_news,
            "hospital_infrastructure": hospital_data[:10] # send top 10 zones to save tokens
        }, ensure_ascii=False, separators=(",", ":"))

    def generate_direct_analysis(self, geo: dict[str, Any], location: str, time_frame: str = "Current and Next 7 Days") -> dict[str, Any]:
        if not settings.groq_api_key:
            raise ValueError("Groq API key not set. Please set GROQ_API_KEY environment variable.")

        lat, lon, city = geo["lat"], geo["lon"], geo["city"]
        context = self.build_analysis_context(lat, lon, city)
        prompt = (
            f"You are a health intelligence analyst for {city}, {geo.get('country','')}. "
            f"The analysis time range is: {time_frame}. (e.g. 6-July-2025 to 6-July-2027) "
            f"Use the provided context (which includes real-time weather, festival/event news, and sample hospital infrastructure data) "
            f"and return compact JSON with keys: "
            "location, generated_at, executive_summary, stock_out_warnings, demand_forecasts, "
            "redistribution_recommendations, flagged_centres, overall_risk_level, recommended_actions, "
            "accuracy_confidence_score, data_sources_used. "
            f"Address stock monitoring, patient footfall, bed availability, doctor attendance, and test audits for the given time range. "
            f"Plan the necessary actions and generate early stock-out warnings, demand forecasts, and redistribution recommendations across the zones strictly according to the context data provided. "
            f"Provide an 'accuracy_confidence_score' (0-100) estimating how confident you are in the plan based on the data. "
            f"List the 'data_sources_used'. Flag underperforming/under-resourced centres for intervention. Context:{context}"
        )

        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.groq_model,
            "messages": [
                {"role": "system", "content": "Return compact JSON only. No markdown. Use this structure: {\"location\": \"...\", \"generated_at\": \"...\", \"executive_summary\": \"...\", \"stock_out_warnings\": [], \"demand_forecasts\": {}, \"redistribution_recommendations\": [], \"flagged_centres\": [], \"overall_risk_level\": \"...\", \"recommended_actions\": [], \"accuracy_confidence_score\": 0, \"data_sources_used\": []}"},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
            "max_tokens": 1024,
        }

        logger.info("Sending compact Groq analysis request for %s", location)
        logger.debug(f"[System Log] Context Payload Size: {len(context)} chars")
        logger.debug(f"[System Log] Prompt Sent: {prompt[:200]}...")
        try:
            response = requests.post(settings.groq_api_base, headers=headers, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
        except Exception as exc:
            logger.warning("Groq request failed for %s: %s", location, exc)
            return {
                "location": {"city": city, "country": geo.get("country", "")},
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "executive_summary": "Groq analysis unavailable; using fallback summary.",
                "stock_out_warnings": [],
                "demand_forecasts": {},
                "redistribution_recommendations": [],
                "flagged_centres": [],
                "overall_risk_level": "unknown",
                "recommended_actions": ["Retry the request shortly."],
                "accuracy_confidence_score": 0,
                "data_sources_used": [],
            }

        if content.startswith("```"):
            content = content.strip().strip("`")
            if content.startswith("json"):
                content = content[4:].strip()

        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            content = content[start : end + 1]

        try:
            parsed = json.loads(content)
            logger.debug(f"[System Log] Successfully parsed JSON from LLM: Keys: {list(parsed.keys())}")
            return parsed
        except json.JSONDecodeError as exc:
            logger.warning("Failed to decode JSON from Groq: %s\nContent: %s", exc, content)
            return {
                "location": {"city": city, "country": geo.get("country", "")},
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "executive_summary": "Failed to parse Groq response; using fallback.",
                "stock_out_warnings": [],
                "demand_forecasts": {},
                "redistribution_recommendations": [],
                "flagged_centres": [],
                "overall_risk_level": "unknown",
                "recommended_actions": ["Review logs for malformed JSON."],
                "accuracy_confidence_score": 0,
                "data_sources_used": [],
            }
