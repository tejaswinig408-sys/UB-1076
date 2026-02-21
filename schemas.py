from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    name: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=6, max_length=200)


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: dict


class LocationInput(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None


class SoilFarmDetails(BaseModel):
    soil_type: Optional[str] = None
    ph: Optional[float] = Field(default=None, ge=0, le=14)
    nitrogen: Optional[float] = Field(default=None, ge=0)
    phosphorus: Optional[float] = Field(default=None, ge=0)
    potassium: Optional[float] = Field(default=None, ge=0)
    farm_size_acres: Optional[float] = Field(default=None, ge=0)
    irrigation_type: Optional[str] = None
    season: Optional[Literal["Kharif", "Rabi", "Zaid", "All"]] = None


class RecommendationResponse(BaseModel):
    recommended_crops: list[dict]
    rationale: str


class RiskPredictionResponse(BaseModel):
    risk_score: float = Field(ge=0, le=1)
    risk_level: Literal["Low", "Medium", "High"]
    top_risks: list[str]
    mitigation: list[str]


class MarketPriceInsight(BaseModel):
    commodity: str
    market: str
    price_inr_per_quintal: float
    trend: Literal["up", "down", "flat"]
    updated_at: str


class Scheme(BaseModel):
    title: str
    eligibility: str
    benefits: str
    how_to_apply: str
    official_link: Optional[str] = None


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    intents: list[str] = []

