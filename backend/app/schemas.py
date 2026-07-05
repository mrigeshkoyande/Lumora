from typing import Optional

from pydantic import BaseModel, Field


class SurveillanceRequest(BaseModel):
    location: str = Field(
        ...,
        description="City, region, or 'City, Country' string",
        examples=["Mumbai, India", "London, UK", "New York, US"],
    )
    time_frame: Optional[str] = Field(
        default="Current and Next 7 Days",
        description="The time frame for the analysis (e.g., 'Next 24 hours', 'Next 7 days')",
        examples=["Next 24 hours", "Next 7 days", "Upcoming Winter"],
    )


class GeoResponse(BaseModel):
    city: str
    country: str
    state: Optional[str]
    lat: float
    lon: float


class AnalyzeResponse(BaseModel):
    location: GeoResponse
    report: dict
    meta: dict
