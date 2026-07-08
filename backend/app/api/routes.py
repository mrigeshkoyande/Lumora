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
from app.services.inventory_agent import InventoryOrchestrator

router = APIRouter()
external_service = ExternalService()
analysis_service = AnalysisService(external_service)
notification_service = NotificationService()
inventory_orchestrator = InventoryOrchestrator()


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
    
    # Save the entire response in a proper UI/UX report friendly way for further play
    import os
    os.makedirs("saved_reports", exist_ok=True)
    report_filename = f"saved_reports/analysis_{req.location.replace(' ', '_')}_{int(datetime.utcnow().timestamp())}.md"
    
    with open(report_filename, "w", encoding="utf-8") as f:
        f.write(f"# Analysis Report for {req.location}\n\n")
        f.write(f"**Generated At:** {payload['meta']['requested_at']}\n")
        f.write(f"**Location Data:** `{json.dumps(geo)}`\n\n")
        f.write("## Report Summary\n")
        if isinstance(report, dict) and "error" not in report:
            f.write("```json\n")
            f.write(json.dumps(report, indent=4))
            f.write("\n```\n")
        else:
            f.write(str(report) + "\n")
            
    logger.info("Analyze request completed for location=%s. Report saved to %s", req.location, report_filename)
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


@router.get("/hospitals/coverage", tags=["hospitals"], summary="Get zonewise hospital coverage and infrastructure data")
def get_hospital_coverage():
    import os
    import csv
    logger.info("Hospital coverage requested")
    
    hospital_data = {}
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    
    # Read D60. Zonewise Hospital Coverage.csv
    csv_path_60 = os.path.join(base_dir, "D60. Zonewise Hospital Coverage.csv")
    try:
        with open(csv_path_60, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                zone = row.get("Zone Name", "").strip()
                if zone:
                    hospital_data[zone] = {
                        "city": row.get("City Name", "").strip(),
                        "zone_number": row.get("Zone Number", "").strip(),
                        "zone": zone,
                        "hospitals": int(row.get("No.of Hospitals/Nursing Homes", 0) or 0),
                        "beds": int(row.get("No.of beds", 0) or 0),
                        "stock_availability": float(row.get("Medicinal Stocks Availability (%)", 0) or 0),
                        "ambulances": 0
                    }
    except Exception as e:
        logger.warning(f"Could not load D60 hospital dataset: {e}")
        
    # Read D63. Zonewise Medical Infrastructure.csv
    csv_path_63 = os.path.join(base_dir, "D63. Zonewise Medical Infrastructure.csv")
    try:
        with open(csv_path_63, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                zone = row.get("Zone Name", "").strip()
                if zone and zone in hospital_data:
                    hospital_data[zone]["ambulances"] = int(row.get("No of Ambulances", 0) or 0)
    except Exception as e:
        logger.warning(f"Could not load D63 hospital dataset: {e}")
        
    return list(hospital_data.values())


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


@router.get("/inventory/poll", tags=["inventory"], summary="Poll inventory data and generate AI insights for low stock")
async def poll_inventory():
    logger.info("Polling inventory data requested via API")
    try:
        report = await asyncio.to_thread(inventory_orchestrator.poll_once)
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": report
        }
    except Exception as exc:
        logger.warning("Failed to poll inventory: %s", str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/weather/poll", tags=["weather"], summary="Poll weather forecast for a given time frame")
def poll_weather(location: str, time_frame: str = "daily"):
    logger.info("Weather poll requested for location=%s, time_frame=%s", location, time_frame)
    try:
        geo = external_service.geocode_location(location)
    except ValueError as exc:
        logger.warning("Weather poll geocode failed for %s: %s", location, str(exc))
        raise HTTPException(status_code=404, detail=str(exc))

    weather_raw = external_service.fetch_weather_forecast(geo["lat"], geo["lon"], geo["city"], time_frame)
    try:
        weather_data = json.loads(weather_raw)
    except Exception:
        weather_data = {"error": "Unable to parse weather response"}

    return {
        "status": "success",
        "location": geo,
        "data": weather_data
    }


@router.get("/weather/current", tags=["weather"], summary="Fetch detailed current weather and AQI")
def current_weather(location: str):
    logger.info("Detailed current weather requested for location=%s", location)
    try:
        geo = external_service.geocode_location(location)
    except ValueError as exc:
        logger.warning("Current weather geocode failed for %s: %s", location, str(exc))
        raise HTTPException(status_code=404, detail=str(exc))

    weather_raw = external_service.fetch_weather_aqi(geo["lat"], geo["lon"], geo["city"])
    try:
        weather_data = json.loads(weather_raw)
    except Exception:
        weather_data = {"error": "Unable to parse weather response"}

    return {
        "status": "success",
        "location": geo,
        "data": weather_data
    }


@router.get("/news/latest", tags=["news"], summary="Fetch the latest health and local news")
def latest_news(location: str):
    logger.info("Latest news requested for location=%s", location)
    # Geocoding isn't strictly required for the news endpoint as it uses the raw string, 
    # but we do it to standardize the location name if desired. 
    try:
        geo = external_service.geocode_location(location)
        search_location = geo["city"]
    except ValueError as exc:
        logger.warning("News geocode failed for %s: %s, falling back to raw string", location, str(exc))
        search_location = location

    news_raw = external_service.fetch_health_news(search_location)
    try:
        news_data = json.loads(news_raw)
    except Exception:
        news_data = {"error": "Unable to parse news response"}

    return {
        "status": "success",
        "search_location": search_location,
        "data": news_data
    }
