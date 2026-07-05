from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Health Surveillance Multi-Agent API",
    description="Autonomous multi-agent system for location-based health threat intelligence.",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "health", "description": "Health and status endpoints."},
        {"name": "geocoding", "description": "Location and geocoding utilities."},
        {"name": "analysis", "description": "Agent analysis endpoints."},
        {"name": "snapshot", "description": "Weather and health snapshot endpoints."},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/docs")
