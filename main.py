from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

import jwt
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import data_sources
from .db import get_db, init_db
from .ml import FarmContext, predict_risk, recommend_crops
from .schemas import (
    AuthResponse,
    ChatRequest,
    ChatResponse,
    LocationInput,
    LoginRequest,
    RecommendationResponse,
    RegisterRequest,
    RiskPredictionResponse,
    SoilFarmDetails,
)
from .security import create_access_token, hash_password, decode_token, verify_password

app = FastAPI(title="KrishiRakshak AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"id": int(payload["sub"]), "email": payload.get("email"), "name": payload.get("name")}


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "fastapi", "time": _utc_now()}


@app.post("/auth/register", response_model=AuthResponse)
def register(body: RegisterRequest) -> AuthResponse:
    pw_hash, salt = hash_password(body.password)
    with get_db() as db:
        try:
            cur = db.execute(
                "INSERT INTO users(email, name, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)",
                (body.email.lower().strip(), body.name.strip(), pw_hash, salt, _utc_now()),
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Email already registered (or invalid).")
        user_id = int(cur.lastrowid)
    token = create_access_token(user_id=user_id, email=body.email, name=body.name)
    return AuthResponse(access_token=token, user={"id": user_id, "email": body.email, "name": body.name})


@app.post("/auth/login", response_model=AuthResponse)
def login(body: LoginRequest) -> AuthResponse:
    with get_db() as db:
        row = db.execute("SELECT id, email, name, password_hash, salt FROM users WHERE email = ?", (body.email.lower().strip(),)).fetchone()
    if not row or not verify_password(body.password, row["password_hash"], row["salt"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user_id=int(row["id"]), email=row["email"], name=row["name"])
    return AuthResponse(access_token=token, user={"id": int(row["id"]), "email": row["email"], "name": row["name"]})


@app.get("/me")
def me(user: dict = Depends(get_current_user)) -> dict:
    return {"user": user}


@app.post("/profile/location")
def save_location(body: LocationInput, user: dict = Depends(get_current_user)) -> dict:
    with get_db() as db:
        existing = db.execute("SELECT id FROM farm_profiles WHERE user_id = ?", (user["id"],)).fetchone()
        if existing:
            db.execute(
                "UPDATE farm_profiles SET latitude=?, longitude=?, location_name=?, last_updated=? WHERE user_id=?",
                (body.latitude, body.longitude, body.location_name, _utc_now(), user["id"]),
            )
        else:
            db.execute(
                """
                INSERT INTO farm_profiles(user_id, latitude, longitude, location_name, last_updated)
                VALUES (?, ?, ?, ?, ?)
                """,
                (user["id"], body.latitude, body.longitude, body.location_name, _utc_now()),
            )
    return {"ok": True}


@app.post("/profile/soil-farm")
def save_soil_farm(body: SoilFarmDetails, user: dict = Depends(get_current_user)) -> dict:
    with get_db() as db:
        existing = db.execute("SELECT id FROM farm_profiles WHERE user_id = ?", (user["id"],)).fetchone()
        if existing:
            db.execute(
                """
                UPDATE farm_profiles
                SET soil_type=?, ph=?, nitrogen=?, phosphorus=?, potassium=?,
                    farm_size_acres=?, irrigation_type=?, season=?, last_updated=?
                WHERE user_id=?
                """,
                (
                    body.soil_type,
                    body.ph,
                    body.nitrogen,
                    body.phosphorus,
                    body.potassium,
                    body.farm_size_acres,
                    body.irrigation_type,
                    body.season,
                    _utc_now(),
                    user["id"],
                ),
            )
        else:
            db.execute(
                """
                INSERT INTO farm_profiles(
                  user_id, soil_type, ph, nitrogen, phosphorus, potassium,
                  farm_size_acres, irrigation_type, season, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user["id"],
                    body.soil_type,
                    body.ph,
                    body.nitrogen,
                    body.phosphorus,
                    body.potassium,
                    body.farm_size_acres,
                    body.irrigation_type,
                    body.season,
                    _utc_now(),
                ),
            )
    return {"ok": True}


@app.get("/profile")
def get_profile(user: dict = Depends(get_current_user)) -> dict:
    with get_db() as db:
        row = db.execute("SELECT * FROM farm_profiles WHERE user_id = ?", (user["id"],)).fetchone()
    return {"profile": dict(row) if row else None}


@app.get("/ai/recommendation", response_model=RecommendationResponse)
def ai_recommendation(user: dict = Depends(get_current_user)) -> RecommendationResponse:
    with get_db() as db:
        row = db.execute("SELECT * FROM farm_profiles WHERE user_id = ?", (user["id"],)).fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="Please submit your location and soil/farm details first.")

    ctx = FarmContext(
        soil_type=row["soil_type"],
        ph=row["ph"],
        n=row["nitrogen"],
        p=row["phosphorus"],
        k=row["potassium"],
        season=row["season"],
        irrigation_type=row["irrigation_type"],
    )
    crops, rationale = recommend_crops(ctx)
    return RecommendationResponse(recommended_crops=crops, rationale=rationale)


@app.get("/ai/risk", response_model=RiskPredictionResponse)
def ai_risk(user: dict = Depends(get_current_user)) -> RiskPredictionResponse:
    with get_db() as db:
        row = db.execute("SELECT * FROM farm_profiles WHERE user_id = ?", (user["id"],)).fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="Please submit your location and soil/farm details first.")

    ctx = FarmContext(
        soil_type=row["soil_type"],
        ph=row["ph"],
        n=row["nitrogen"],
        p=row["phosphorus"],
        k=row["potassium"],
        season=row["season"],
        irrigation_type=row["irrigation_type"],
    )
    score, level, top, mitigation = predict_risk(ctx, latitude=row["latitude"], longitude=row["longitude"])
    return RiskPredictionResponse(risk_score=score, risk_level=level, top_risks=top, mitigation=mitigation)


@app.get("/insights/market-prices")
def market_prices(user: dict = Depends(get_current_user)) -> dict:
    return {"items": data_sources.get_mock_market_prices()}


@app.get("/insights/schemes")
def schemes(user: dict = Depends(get_current_user)) -> dict:
    return {"items": data_sources.get_mock_schemes()}


def _chat_reply(message: str) -> tuple[str, list[str]]:
    m = message.lower().strip()
    intents: list[str] = []
    if any(k in m for k in ["price", "market", "mandi"]):
        intents.append("market_price")
        return (
            "For market prices, check the Market Price Insights tab. Tell me your commodity and nearest market for more targeted guidance.",
            intents,
        )
    if any(k in m for k in ["scheme", "subsidy", "pm-kisan", "pmfby", "insurance"]):
        intents.append("gov_scheme")
        return (
            "You can explore Government Schemes in the Schemes section. If you share your state and landholding category, I can help shortlist eligibility.",
            intents,
        )
    if any(k in m for k in ["soil", "ph", "npk", "fertilizer"]):
        intents.append("soil_advice")
        return (
            "Soil health is key. If you share pH and NPK values, I can suggest a nutrient-balancing plan and suitable crops.",
            intents,
        )
    if any(k in m for k in ["risk", "disease", "pest", "weather"]):
        intents.append("risk")
        return (
            "For risk prediction, complete your soil/farm profile then open Crop Risk Prediction. Meanwhile, scout weekly and follow IPM practices.",
            intents,
        )
    intents.append("general")
    return (
        "Hi! I’m the KrishiRakshak AI assistant. I can help with crop selection, soil inputs, market prices, schemes, and risk mitigation. What are you growing and where?",
        intents,
    )


@app.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest, user: dict = Depends(get_current_user)) -> ChatResponse:
    reply, intents = _chat_reply(body.message)
    return ChatResponse(reply=reply, intents=intents)

