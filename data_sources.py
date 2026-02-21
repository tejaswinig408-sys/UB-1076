from __future__ import annotations

from datetime import datetime, timezone


def get_mock_market_prices() -> list[dict]:
    # Replace with real data integration later (Agmarknet/eNAM APIs or scraped sources as permitted).
    now = datetime.now(timezone.utc).isoformat()
    return [
        {"commodity": "Wheat", "market": "Delhi", "price_inr_per_quintal": 2550.0, "trend": "up", "updated_at": now},
        {"commodity": "Rice", "market": "Kolkata", "price_inr_per_quintal": 2850.0, "trend": "flat", "updated_at": now},
        {"commodity": "Maize", "market": "Hyderabad", "price_inr_per_quintal": 2150.0, "trend": "down", "updated_at": now},
        {"commodity": "Onion", "market": "Nashik", "price_inr_per_quintal": 1750.0, "trend": "up", "updated_at": now},
    ]


def get_mock_schemes() -> list[dict]:
    return [
        {
            "title": "PM-KISAN (Income Support)",
            "eligibility": "Small and marginal farmer families (as per scheme rules).",
            "benefits": "₹6,000/year income support in 3 installments.",
            "how_to_apply": "Register/verify details via official portal; link Aadhaar and bank account.",
            "official_link": "https://pmkisan.gov.in/",
        },
        {
            "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "eligibility": "Farmers growing notified crops in notified areas.",
            "benefits": "Crop insurance against yield loss due to natural calamities/pests/diseases.",
            "how_to_apply": "Apply through banks/insurance portal before the cut-off date.",
            "official_link": "https://pmfby.gov.in/",
        },
        {
            "title": "Soil Health Card Scheme",
            "eligibility": "All farmers.",
            "benefits": "Soil test-based nutrient recommendations and soil health reports.",
            "how_to_apply": "Contact local agriculture office/soil testing lab; request a soil test.",
            "official_link": "https://soilhealth.dac.gov.in/",
        },
    ]

