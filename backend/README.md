# Lumora Backend - Health Surveillance & Inventory Orchestrator

This is the FastAPI backend for the Lumora platform. It provides endpoints for autonomous health risk analysis and supply chain procurement orchestration.

## Key Features

1. **Autonomous Health Risk Analysis (`/analyze`)**
   - Geocodes locations and fetches real-time weather, AQI, and health news.
   - Generates comprehensive health risk reports using AI agents.
   - Supports streaming responses (`/analyze/stream`).
   - Webhook endpoint for SMS alerts via Twilio (`/webhook/alert`).

2. **Supply Chain Procurement Orchestrator (`/inventory/poll`)**
   - Built with the **Agno** Agent Framework and powered by Groq (LLaMA-3).
   - Monitors `inventory_data.csv` for real-time stock levels across health zones.
   - Automatically detects low stock and triggers an LLM to generate detailed procurement alerts.
   - Intelligent state tracking prevents duplicate alerts for ongoing low stock.

## Getting Started

### Prerequisites
- Python 3.9+
- A `.env` file (copy from `.env.example`)

### Installation & Execution

```bash
# Install dependencies
pip install -r requirements.txt

# Start the development server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## API Endpoints Overview
- `GET /health` - Health check.
- `GET /geocode?location=...` - Resolve location to coordinates.
- `POST /analyze` - Analyze health risk for a location.
- `POST /analyze/stream` - Streamed health risk analysis.
- `GET /snapshot?location=...` - Fetch weather and health snapshot.
- `POST /webhook/alert` - Trigger autonomous AI analysis and SMS alert.
- `GET /inventory/poll` - Poll inventory data and generate AI insights for low stock.
