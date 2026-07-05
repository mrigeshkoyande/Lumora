# Code for Communities: Health Surveillance & Threat Intelligence

An autonomous, location-based multi-agent intelligence system built to analyze and anticipate public health threats. By aggregating real-time weather conditions, air quality indices (AQI), and targeted news publications, the system uses large language models (LLMs) to perform complex reasoning as a virtual panel of health experts (Signal Collector, Festival Surge Anticipator, and Pollution Risk Agent).

---

## 🗺️ System Overview

The workspace is organized into two primary components:
1. **`backend`**: A FastAPI service that integrates external APIs (OpenWeatherMap, NewsAPI) and feeds structured context into a Groq-powered LLM agent pipeline.
2. **`frontend`**: Reserved scaffold for the interactive community health dashboard.

```
code_for_communities/
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py          # FastAPI Endpoint Handlers
│   │   ├── services/
│   │   │   ├── analysis.py        # Groq LLM Multi-Agent Orchestration
│   │   │   └── external.py        # Weather, AQI, and NewsAPI Clients
│   │   ├── config.py              # Environment configuration & Settings
│   │   ├── main.py                # FastAPI Application Setup & Lifespan
│   │   └── schemas.py             # Pydantic Request/Response Models
│   ├── .env.example               # Template for API credentials
│   ├── main1.py                   # App entrypoint importer
│   ├── run.py                     # Local development startup script
│   └── requirements.txt           # Python package dependencies
└── frontend/                      # User Interface (Future Implementation)
    └── readme.md                  # Frontend scaffold readme
```

---

## ⚡ Key Features

*   **Location Geocoding**: Automatically translates city or region search strings to exact latitude and longitude coordinates.
*   **Environmental Monitoring**: Fetches real-time temperature, humidity, wind conditions, and a detailed Air Quality Index (AQI) with gas concentrations (PM2.5, PM10, CO, NO2, O3).
*   **Public Health Signal Gathering**: Scans recent news for localized keywords targeting disease outbreaks, respiratory illnesses, and official public health alerts.
*   **Multi-Agent Reasoning**: Simulates a multi-agent review (consisting of the *Signal Collector*, *Festival Surge Anticipator*, and *Pollution Risk Agent*) to assess risks, identify compound threats, and formulate immediate recommended actions.
*   **Server-Sent Progress Streaming (NDJSON)**: Provides real-time execution feedback to the frontend as data is gathered and analyzed, preventing UI timeouts during longer agent runs.

---

## 🛠️ Backend Implementation

### Core Components
*   **Application entry point**: [main.py](file:///d:/Users/Desktop/code_for_communities/backend/app/main.py) registers middleware (cors, logging) and configures the FastAPI router.
*   **Endpoint Routing**: [routes.py](file:///d:/Users/Desktop/code_for_communities/backend/app/api/routes.py) defines the RESTful and streaming routes.
*   **External Integrations**: [external.py](file:///d:/Users/Desktop/code_for_communities/backend/app/services/external.py) handles low-level HTTP requests to geocoding, weather, AQI, and NewsAPI.
*   **AI Agent Orchestration**: [analysis.py](file:///d:/Users/Desktop/code_for_communities/backend/app/services/analysis.py) builds a compact contextual prompt, targets the Groq Chat Completion API using `llama-3.1-8b-instant`, and cleanses/parses the model's output into structured JSON.
*   **Data Models**: [schemas.py](file:///d:/Users/Desktop/code_for_communities/backend/app/schemas.py) guarantees type safety and request/response shapes.

### API Endpoints

#### 1. Health Check
*   **Endpoint**: `GET /health`
*   **Summary**: Verify backend status.
*   **Response**:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-07-05T11:15:00.000Z"
    }
    ```

#### 2. Geolocation Resolution
*   **Endpoint**: `GET /geocode?location={location_query}`
*   **Summary**: Converts a text location string into latitude and longitude coordinate details.
*   **Response**:
    ```json
    {
      "city": "Mumbai",
      "country": "IN",
      "state": "Maharashtra",
      "lat": 19.076,
      "lon": 72.8777
    }
    ```

#### 3. Complete Health Risk Analysis
*   **Endpoint**: `POST /analyze`
*   **Request Body**:
    ```json
    {
      "location": "Mumbai, India"
    }
    ```
*   **Response**:
    ```json
    {
      "location": {
        "city": "Mumbai",
        "country": "IN",
        "state": "Maharashtra",
        "lat": 19.076,
        "lon": 72.8777
      },
      "report": {
        "location": {"city": "Mumbai", "country": "IN"},
        "generated_at": "2026-07-05T11:15:00.000Z",
        "executive_summary": "High particulate matter combined with warm weather poses mild risks...",
        "overall_risk_level": "moderate",
        "signal_assessment": {"status": "nominal"},
        "festival_surge_forecast": {"status": "low_risk"},
        "pollution_risk": {"status": "elevated", "main_pollutant": "PM2.5"},
        "compound_risks": ["Synergistic effect of humidity and high particulate levels on asthma patients"],
        "recommended_actions": [
          "Advise sensitive groups to wear masks outdoors",
          "Ensure local clinics prepare respiratory nebulizers"
        ],
        "data_sources": ["OpenWeatherMap", "NewsAPI"]
      },
      "meta": {
        "requested_at": "2026-07-05T11:15:00.000Z",
        "agents_used": ["Signal Collector", "Festival Surge Anticipator", "Pollution Risk Agent"],
        "model": "llama-3.1-8b-instant"
      }
    }
    ```

#### 4. Streaming Health Risk Analysis
*   **Endpoint**: `POST /analyze/stream`
*   **Request Body**:
    ```json
    {
      "location": "London, UK"
    }
    ```
*   **Format**: `application/x-ndjson` (newline-delimited JSON). Streams real-time progress updates, a weather/AQI snapshot, and finishes with the final JSON report under the `"result"` type.

#### 5. Raw Health and Environmental Snapshot
*   **Endpoint**: `GET /snapshot?location={location_query}`
*   **Summary**: Aggregates raw data fields from external services (weather state, detailed air quality measurements, and news articles) without running the LLM analysis.

---

## 🚀 Getting Started

### Prerequisites
*   Python 3.10 or higher
*   Valid API keys for:
    *   **OpenWeatherMap** (for coordinates, weather, and air pollution)
    *   **NewsAPI** (for searching disease/respiratory news)
    *   **Groq Cloud** (for running the Llama 3.1 8B instant agent model)

### Installation

1.  **Clone the workspace** and navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment**:
    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # macOS/Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables**:
    *   Copy [\.env.example](file:///d:/Users/Desktop/code_for_communities/backend/.env.example) to `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Open `.env` and fill in your actual credentials:
        ```env
        OPENWEATHER_API_KEY=your_openweather_api_key
        NEWS_API_KEY=your_news_api_key
        GROQ_API_KEY=your_groq_api_key
        GROQ_MODEL=llama-3.1-8b-instant
        ```

### Running the Application

Start the local development server:
```bash
python run.py
```
Or run uvicorn manually to enable hot-reloading:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, the interactive API documentation (Swagger UI) is available at:
*   [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🌐 Frontend Status

The [frontend/](file:///d:/Users/Desktop/code_for_communities/frontend) directory is currently scaffolded. A basic placeholder [readme.md](file:///d:/Users/Desktop/code_for_communities/frontend/readme.md) resides there. The next logical phase of development involves establishing a modern web UI (e.g., using Vite + React or pure Vanilla JS/HTML/CSS) to communicate with the streaming and REST endpoints of the backend API, visualising:
- Current environmental safety metrics.
- Global outbreak news monitoring.
- Interactive multi-agent threat recommendations.
