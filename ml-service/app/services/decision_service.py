"""
Orchestrates Step 4: combines a REAL forecast (Step 3's
forecast_service) with SYNTHETIC operational data (Parts 1-2) to
produce a risk assessment and human-reviewable recommendations. Also
exposes scenario analysis (supply shock + Monte Carlo, Part 5).
"""

from __future__ import annotations

import json
from pathlib import Path

from app.services.forecast_service import generate_forecast, CategoryNotFoundError, ModelNotTrainedError
from app.services.risk_service import assess_risk
from app.services.recommendation_service import build_recommendations
from app.services.scenario_service import run_supply_shock_monte_carlo
from app.synthetic.generator import (
    OperationalRecord, generate_operational_record, operational_record_to_dict, SYNTHETIC_DATA_NOTICE,
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SYNTHETIC_DATA_PATH = PROJECT_ROOT / "data" / "synthetic" / "operational_data.json"


def load_operational_record(category: str) -> OperationalRecord:
    """
    Loads from data/synthetic/operational_data.json if it exists
    (Part 2's script), otherwise generates one on the fly with the
    same deterministic per-category seeding - either way the same
    category always resolves to the same synthetic values.
    """
    if SYNTHETIC_DATA_PATH.exists():
        with open(SYNTHETIC_DATA_PATH, "r") as f:
            data = json.load(f)
        if category in data:
            rec = data[category]
            return OperationalRecord(
                category=rec["category"],
                inventory_units=rec["inventory_units"],
                reorder_point_units=rec["reorder_point_units"],
                supplier_lead_time_days=rec["supplier_lead_time_days"],
                expiry_days_remaining=rec["expiry_days_remaining"],
                patient_impact_score=rec["patient_impact_score"],
                substitute_available=rec["substitute_available"],
                region=rec["region"],
                unit_price_inr=rec["unit_price_inr"],
                promotion_active=rec["promotion_active"],
            )
    return generate_operational_record(category)


def get_decision_intelligence(category: str, horizon: int) -> dict:
    forecast_result = generate_forecast(category, horizon)  # raises CategoryNotFoundError / ModelNotTrainedError
    operational_record = load_operational_record(category)

    avg_daily_demand = sum(p["predictedSales"] for p in forecast_result["forecast"]) / len(forecast_result["forecast"])
    risk = assess_risk(category, avg_daily_demand, operational_record)
    recommendations = build_recommendations(
        category, forecast_result["trend"], forecast_result["seasonality"]["detected"], risk, operational_record
    )

    return {
        "category": category,
        "horizon": horizon,
        "forecastSummary": {
            "modelType": forecast_result["modelType"],
            "trend": forecast_result["trend"],
            "seasonalityDetected": forecast_result["seasonality"]["detected"],
            "avgDailyDemand": round(avg_daily_demand, 4),
            "confidence": forecast_result["confidence"],
        },
        "riskAssessment": risk.__dict__,
        "operationalData": operational_record_to_dict(operational_record),
        "recommendations": [r.__dict__ for r in recommendations],
        "dataDisclaimer": SYNTHETIC_DATA_NOTICE,
    }


def run_scenario(category: str, horizon: int, supply_shock_pct: float, n_simulations: int) -> dict:
    forecast_result = generate_forecast(category, horizon)  # raises the same two exceptions
    operational_record = load_operational_record(category)

    result = run_supply_shock_monte_carlo(
        category=category,
        forecast_points=forecast_result["forecast"],
        inventory_units=operational_record.inventory_units,
        lead_time_days=operational_record.supplier_lead_time_days,
        mean_smape_pct=forecast_result["confidence"]["meanSmapePct"],
        supply_shock_pct=supply_shock_pct,
        n_simulations=n_simulations,
    )
    # ScenarioResult's fields are snake_case (internal dataclass
    # convention, matching app/models and the rest of app/services);
    # ScenarioResponse's fields are camelCase (the documented API
    # contract, matching ForecastResponse/DecisionIntelligenceResponse).
    # This mapping is the seam between the two - it's the fix, not a
    # contract change in either direction.
    return {
        "category": result.category,
        "nSimulations": result.n_simulations,
        "supplyShockPct": result.supply_shock_pct,
        "stockoutProbability": result.stockout_probability,
        "meanShortfallUnits": result.mean_shortfall_units,
        "note": result.note,
    }