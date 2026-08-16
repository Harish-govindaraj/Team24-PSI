from app.services.risk_service import (
    compute_days_of_supply, compute_stockout_risk, compute_expiry_risk, compute_patient_impact_priority,
)


def test_days_of_supply_zero_demand_is_infinite():
    assert compute_days_of_supply(100, 0.0) == float("inf")


def test_stockout_risk_high_when_supply_below_lead_time():
    days = compute_days_of_supply(50, 10.0)
    assert compute_stockout_risk(days, lead_time_days=10) == "high"


def test_stockout_risk_low_when_ample_supply():
    days = compute_days_of_supply(1000, 5.0)
    assert compute_stockout_risk(days, lead_time_days=10) == "low"


def test_expiry_risk_high_when_expiry_sooner_than_depletion():
    assert compute_expiry_risk(expiry_days_remaining=5, days_of_supply=30) == "high"


def test_patient_impact_priority_critical_case():
    level, score = compute_patient_impact_priority(patient_impact_score=10, stockout_risk="high")
    assert level == "critical"
    assert score == 30