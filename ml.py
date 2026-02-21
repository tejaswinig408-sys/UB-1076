from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class FarmContext:
    soil_type: Optional[str]
    ph: Optional[float]
    n: Optional[float]
    p: Optional[float]
    k: Optional[float]
    season: Optional[str]
    irrigation_type: Optional[str]


def _score_soil_balance(n: Optional[float], p: Optional[float], k: Optional[float]) -> float:
    vals = [v for v in (n, p, k) if v is not None]
    if not vals:
        return 0.5
    avg = sum(vals) / len(vals)
    spread = max(vals) - min(vals) if len(vals) > 1 else 0.0
    # Normalize roughly: higher spread => more imbalance
    imbalance = min(1.0, spread / max(1.0, avg))
    return 1.0 - 0.6 * imbalance


def recommend_crops(ctx: FarmContext) -> tuple[list[dict], str]:
    score = _score_soil_balance(ctx.n, ctx.p, ctx.k)
    ph = ctx.ph

    crops: list[dict] = []
    rationale_bits: list[str] = []

    season = (ctx.season or "All").lower()
    if season in {"kharif", "all"}:
        crops += [
            {"crop": "Rice", "confidence": 0.55 + 0.25 * score, "why": "Common Kharif staple; performs well with reliable water."},
            {"crop": "Maize", "confidence": 0.50 + 0.30 * score, "why": "Good Kharif crop; adaptable to many soils."},
            {"crop": "Cotton", "confidence": 0.45 + 0.25 * score, "why": "Suitable for warm regions; benefits from balanced NPK."},
        ]
        rationale_bits.append("Season includes Kharif.")
    if season in {"rabi", "all"}:
        crops += [
            {"crop": "Wheat", "confidence": 0.55 + 0.25 * score, "why": "Common Rabi crop; prefers neutral pH and balanced nutrients."},
            {"crop": "Mustard", "confidence": 0.50 + 0.25 * score, "why": "Rabi oilseed; tolerates varied soils."},
            {"crop": "Chickpea", "confidence": 0.48 + 0.22 * score, "why": "Legume improving soil health; good for rotations."},
        ]
        rationale_bits.append("Season includes Rabi.")
    if season in {"zaid", "all"}:
        crops += [
            {"crop": "Watermelon", "confidence": 0.50 + 0.20 * score, "why": "Zaid crop; benefits from irrigation and warm weather."},
            {"crop": "Cucumber", "confidence": 0.48 + 0.20 * score, "why": "Zaid vegetable; responsive to balanced nutrition."},
        ]
        rationale_bits.append("Season includes Zaid.")

    if ph is not None:
        if ph < 5.5:
            rationale_bits.append("Soil seems acidic; consider liming and acid-tolerant crops.")
            for c in crops:
                if c["crop"] in {"Rice"}:
                    c["confidence"] = min(0.95, c["confidence"] + 0.05)
        elif ph > 8.0:
            rationale_bits.append("Soil seems alkaline; consider gypsum and salt-tolerant varieties.")
            for c in crops:
                if c["crop"] in {"Cotton", "Mustard"}:
                    c["confidence"] = min(0.95, c["confidence"] + 0.04)
        else:
            rationale_bits.append("Soil pH looks near-neutral.")

    if ctx.irrigation_type:
        if ctx.irrigation_type.lower() in {"drip", "sprinkler"}:
            rationale_bits.append("Efficient irrigation can improve yield stability.")

    crops = sorted(crops, key=lambda x: x["confidence"], reverse=True)[:6]
    rationale = " ".join(rationale_bits) if rationale_bits else "Recommendations are based on the provided season and soil indicators."
    return crops, rationale


def predict_risk(ctx: FarmContext, *, latitude: Optional[float], longitude: Optional[float]) -> tuple[float, str, list[str], list[str]]:
    # Lightweight baseline “ML” risk score (0..1) using heuristics.
    score = 0.35
    top: list[str] = []
    mitigation: list[str] = []

    if ctx.ph is not None and (ctx.ph < 5.5 or ctx.ph > 8.0):
        score += 0.18
        top.append("Soil pH stress")
        mitigation.append("Test pH and apply lime/gypsum as recommended by local soil lab.")

    balance = _score_soil_balance(ctx.n, ctx.p, ctx.k)
    if balance < 0.55:
        score += 0.15
        top.append("NPK imbalance")
        mitigation.append("Use soil-test-based fertilization and split applications to reduce losses.")

    if ctx.irrigation_type is None or ctx.irrigation_type.strip() == "":
        score += 0.10
        top.append("Irrigation uncertainty")
        mitigation.append("Plan irrigation schedule; adopt mulching and water-saving practices.")

    if latitude is not None:
        # Very rough climate proxy: higher latitudes -> higher frost risk for some crops in Rabi
        if latitude > 25 and (ctx.season or "").lower() == "rabi":
            score += 0.08
            top.append("Cold spell / frost")
            mitigation.append("Use frost-tolerant varieties and avoid late sowing; consider windbreaks.")

    score = max(0.0, min(1.0, score))
    if score < 0.45:
        level = "Low"
    elif score < 0.7:
        level = "Medium"
    else:
        level = "High"

    if not top:
        top = ["General weather variability", "Pest/disease pressure"]
        mitigation = ["Monitor IMD weather alerts and use IPM practices; scout fields weekly."]

    return score, level, top[:3], mitigation[:4]

