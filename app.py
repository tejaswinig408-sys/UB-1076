from __future__ import annotations

import os
from datetime import datetime, timezone

import requests
from flask import Flask, Response, jsonify, request

FASTAPI_BASE = os.environ.get("KRISHIRAKSHAK_FASTAPI_BASE", "http://127.0.0.1:8000")

app = Flask(__name__)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "flask-report", "time": _utc_now()})


def _bearer() -> str | None:
    auth = request.headers.get("Authorization")
    if not auth:
        return None
    return auth


@app.get("/report/download")
def download_report():
    auth = _bearer()
    if not auth:
        return jsonify({"detail": "Missing bearer token"}), 401

    profile = requests.get(f"{FASTAPI_BASE}/profile", headers={"Authorization": auth}, timeout=10).json().get("profile")
    rec = requests.get(f"{FASTAPI_BASE}/ai/recommendation", headers={"Authorization": auth}, timeout=10)
    risk = requests.get(f"{FASTAPI_BASE}/ai/risk", headers={"Authorization": auth}, timeout=10)
    market = requests.get(f"{FASTAPI_BASE}/insights/market-prices", headers={"Authorization": auth}, timeout=10).json().get("items", [])

    if rec.status_code != 200 or risk.status_code != 200:
        return jsonify({"detail": "Complete your profile first (location + soil/farm details)."}), 400

    rec_json = rec.json()
    risk_json = risk.json()

    html = f"""<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>KrishiRakshak AI Report</title>
    <style>
      body {{ font-family: Arial, sans-serif; margin: 24px; color: #0b1220; }}
      .brand {{ display:flex; align-items:center; gap:10px; margin-bottom: 18px; }}
      .logo {{ width: 40px; height: 40px; border-radius: 10px; background:#0ea371; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; }}
      h2 {{ margin-top: 20px; }}
      .card {{ border:1px solid #e6e8ee; border-radius: 12px; padding: 14px; margin-top: 10px; }}
      table {{ border-collapse: collapse; width: 100%; }}
      td, th {{ border: 1px solid #e6e8ee; padding: 8px; text-align:left; }}
      .muted {{ color:#5b6477; }}
    </style>
  </head>
  <body>
    <div class="brand">
      <div class="logo">KA</div>
      <div>
        <div style="font-size:18px;font-weight:800;">KrishiRakshak AI</div>
        <div class="muted">Smart Agriculture & AgriTech Report • Generated {_utc_now()}</div>
      </div>
    </div>

    <h2>Farm Profile</h2>
    <div class="card"><pre style="white-space:pre-wrap;margin:0;">{profile}</pre></div>

    <h2>AI Crop Recommendations</h2>
    <div class="card">
      <div class="muted">{rec_json.get("rationale","")}</div>
      <table style="margin-top:10px;">
        <thead><tr><th>Crop</th><th>Confidence</th><th>Why</th></tr></thead>
        <tbody>
          {''.join([f"<tr><td>{c['crop']}</td><td>{c['confidence']:.2f}</td><td>{c['why']}</td></tr>" for c in rec_json.get("recommended_crops",[])])}
        </tbody>
      </table>
    </div>

    <h2>Crop Risk Prediction</h2>
    <div class="card">
      <div><b>Risk level:</b> {risk_json.get("risk_level")} ({risk_json.get("risk_score"):.2f})</div>
      <div style="margin-top:8px;"><b>Top risks:</b> {', '.join(risk_json.get("top_risks",[]))}</div>
      <div style="margin-top:8px;"><b>Mitigation:</b>
        <ul>{''.join([f"<li>{m}</li>" for m in risk_json.get("mitigation",[])])}</ul>
      </div>
    </div>

    <h2>Market Price Insights (sample)</h2>
    <div class="card">
      <table>
        <thead><tr><th>Commodity</th><th>Market</th><th>Price (₹/quintal)</th><th>Trend</th></tr></thead>
        <tbody>
          {''.join([f"<tr><td>{i['commodity']}</td><td>{i['market']}</td><td>{i['price_inr_per_quintal']}</td><td>{i['trend']}</td></tr>" for i in market])}
        </tbody>
      </table>
    </div>
  </body>
</html>"""

    filename = "krishirakshak_ai_report.html"
    return Response(
        html,
        headers={
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )

