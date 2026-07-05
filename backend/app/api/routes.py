import asyncio
import json
from datetime import datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import logger
from app.schemas import AnalyzeResponse, GeoResponse, SurveillanceRequest
from app.services.analysis import AnalysisService
from app.services.external import ExternalService
from app.services.notification import NotificationService

router = APIRouter()
external_service = ExternalService()
analysis_service = AnalysisService(external_service)
notification_service = NotificationService()


@router.get("/health", tags=["health"], summary="Health check")
def health_check():
    logger.info("Health check requested")
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}


@router.get("/geocode", response_model=GeoResponse, tags=["geocoding"], summary="Resolve location to coordinates")
def geocode(location: str):
    logger.info("Geocode endpoint called with location=%s", location)
    try:
        return external_service.geocode_location(location)
    except ValueError as exc:
        logger.warning("Geocode failed for location=%s: %s", location, str(exc))
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/analyze", response_model=AnalyzeResponse, tags=["analysis"], summary="Analyze health risk for a location")
async def analyze(req: SurveillanceRequest):
    logger.info("Analyze request started for location=%s", req.location)
    try:
        geo = external_service.geocode_location(req.location)
    except ValueError as exc:
        logger.warning("Analyze request failed geocoding for %s: %s", req.location, str(exc))
        raise HTTPException(status_code=404, detail=str(exc))

    try:
        report = await asyncio.to_thread(analysis_service.generate_direct_analysis, geo, req.location, req.time_frame)
    except Exception as exc:
        logger.warning("Failed to generate analysis report for %s: %s", req.location, str(exc))
        report = {"error": str(exc)}

    payload = {
        "location": geo,
        "report": report,
        "meta": {
            "requested_at": datetime.utcnow().isoformat() + "Z",
            "agents_used": ["Signal Collector", "Festival Surge Anticipator", "Pollution Risk Agent"],
            "model": "llama-3.1-8b-instant",
        },
    }
    logger.info("Analyze request completed for location=%s", req.location)
    return payload


@router.post("/analyze/stream", tags=["analysis"], summary="Analyze health risk with progress streaming")
async def analyze_stream(req: SurveillanceRequest):
    logger.info("Analyze stream request started for location=%s", req.location)
    try:
        geo = external_service.geocode_location(req.location)
    except ValueError as exc:
        logger.warning("Analyze stream geocode failed for %s: %s", req.location, str(exc))
        raise HTTPException(status_code=404, detail=str(exc))

    async def event_generator():
        yield json.dumps({"type": "progress", "data": f"Geocoded: {geo['city']}, {geo['country']}"}) + "\n"
        yield json.dumps({"type": "progress", "data": "Fetching weather and AQI data..."}) + "\n"

        weather_snap = external_service.fetch_weather_aqi(geo["lat"], geo["lon"], geo["city"])
        try:
            weather_data = json.loads(weather_snap)
        except Exception:
            weather_data = {"error": "Invalid weather snapshot"}
        yield json.dumps({"type": "weather_snapshot", "data": weather_data}) + "\n"

        yield json.dumps({"type": "progress", "data": "Generating report..."}) + "\n"
        report = await asyncio.to_thread(analysis_service.generate_direct_analysis, geo, req.location, req.time_frame)
        yield json.dumps({"type": "result", "data": report}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


@router.get("/snapshot", tags=["snapshot"], summary="Fetch weather and health snapshot for a location")
def snapshot(location: str):
    logger.info("Snapshot request started for location=%s", location)
    try:
        geo = external_service.geocode_location(location)
    except ValueError as exc:
        logger.warning("Snapshot geocode failed for %s: %s", location, str(exc))
        raise HTTPException(status_code=404, detail=str(exc))

    weather_raw = external_service.fetch_weather_aqi(geo["lat"], geo["lon"], geo["city"])
    news_raw = external_service.fetch_health_news(geo["city"])

    try:
        weather_data = json.loads(weather_raw)
    except Exception:
        weather_data = {"error": "Unable to parse weather response"}

    try:
        news_data = json.loads(news_raw)
    except Exception:
        news_data = {"error": "Unable to parse news response"}

    return {
        "location": geo,
        "weather_aqi": weather_data,
        "health_news": news_data,
        "snapshot_time": datetime.utcnow().isoformat() + "Z",
    }


@router.post("/webhook/alert", tags=["webhook"], summary="Trigger autonomous AI analysis and SMS alert")
async def webhook_alert(req: SurveillanceRequest):
    logger.info("Webhook alert triggered for location=%s", req.location)
    try:
        geo = external_service.geocode_location(req.location)
    except ValueError as exc:
        logger.warning("Webhook geocoding failed: %s", str(exc))
        raise HTTPException(status_code=404, detail=str(exc))

    # 1. Run AI Analysis
    try:
        report = await asyncio.to_thread(analysis_service.generate_direct_analysis, geo, req.location, req.time_frame)
    except Exception as exc:
        logger.warning("Webhook AI analysis failed: %s", str(exc))
        raise HTTPException(status_code=500, detail="AI Analysis failed")

    # 2. Dispatch SMS Alert
    sms_result = await asyncio.to_thread(notification_service.dispatch_alert, report)

    return {
        "status": "success",
        "location": geo,
        "sms_dispatch": sms_result,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
