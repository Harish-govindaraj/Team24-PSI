from app.services.risk_service import RiskAssessment
from app.services.recommendation_service import build_recommendations
from app.synthetic.generator import OperationalRecord


def _record(**overrides):
    base = dict(
        category="R03", inventory_units=100, reorder_point_units=50, supplier_lead_time_days=10,
        expiry_days_remaining=100, patient_impact_score=8, substitute_available=True,
        region="South", unit_price_inr=42.5, promotion_active=False,
    )
    base.update(overrides)
    return OperationalRecord(**base)


def test_high_stockout_risk_produces_reorder_recommendation():
    risk = RiskAssessment(
        category="R03", avg_daily_demand=10.0, days_of_supply=5.0, stockout_risk="high",
        expiry_risk="low", patient_impact_priority="high", priority_score=24.0,
    )
    recs = build_recommendations("R03", trend="stable", seasonality_detected=False, risk_assessment=risk, operational_record=_record())
    assert "Inventory Replenishment" in [r.strategy for r in recs]


def test_every_recommendation_requires_human_approval():
    risk = RiskAssessment(
        category="R03", avg_daily_demand=10.0, days_of_supply=5.0, stockout_risk="high",
        expiry_risk="high", patient_impact_priority="critical", priority_score=30.0,
    )
    recs = build_recommendations("R03", trend="increasing", seasonality_detected=True, risk_assessment=risk, operational_record=_record())
    assert len(recs) > 0
    assert all(r.humanApprovalRequired is True for r in recs)


def test_no_risk_produces_no_action():
    risk = RiskAssessment(
        category="R03", avg_daily_demand=1.0, days_of_supply=-1.0, stockout_risk="low",
        expiry_risk="low", patient_impact_priority="low", priority_score=1.0,
    )
    recs = build_recommendations("R03", trend="stable", seasonality_detected=False, risk_assessment=risk, operational_record=_record())
    assert any(r.strategy == "No Action" for r in recs)