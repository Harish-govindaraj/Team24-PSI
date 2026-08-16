"""
Deterministic, rule-based risk scoring on top of a REAL forecast
(Step 3) and SYNTHETIC operational data (Step 4). No clinical
validation, no guarantee of accuracy - these heuristics surface which
categories deserve human attention first; they don't make decisions.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RiskAssessment:
    category: str
    avg_daily_demand: float
    days_of_supply: float  # -1.0 means "effectively infinite" (avg demand ~0)
    stockout_risk: str            # "low" | "medium" | "high"
    expiry_risk: str              # "low" | "medium" | "high"
    patient_impact_priority: str  # "low" | "medium" | "high" | "critical"
    priority_score: float


def compute_days_of_supply(inventory_units: int, avg_daily_demand: float) -> float:
    if avg_daily_demand <= 0:
        return float("inf")
    return inventory_units / avg_daily_demand


def compute_stockout_risk(days_of_supply: float, lead_time_days: int) -> str:
    if days_of_supply == float("inf"):
        return "low"
    if days_of_supply < lead_time_days:
        return "high"
    if days_of_supply < lead_time_days * 1.5:
        return "medium"
    return "low"


def compute_expiry_risk(expiry_days_remaining: int, days_of_supply: float) -> str:
    if days_of_supply == float("inf"):
        return "low"
    if expiry_days_remaining < days_of_supply:
        return "high"  # stock will likely still be on hand after it expires
    if expiry_days_remaining < days_of_supply * 1.2:
        return "medium"
    return "low"


_RISK_WEIGHT = {"low": 1, "medium": 2, "high": 3}


def compute_patient_impact_priority(patient_impact_score: int, stockout_risk: str) -> tuple[str, float]:
    """
    SYNTHETIC patient_impact_score (1-10) combined with stockout-risk
    weight (1-3) into a 1-30 priority score. A heuristic proxy for
    "how much human attention this deserves" - NOT a clinical
    assessment; the underlying score is synthetic demo data.
    """
    weight = _RISK_WEIGHT[stockout_risk]
    score = patient_impact_score * weight
    if score >= 21:
        level = "critical"
    elif score >= 14:
        level = "high"
    elif score >= 7:
        level = "medium"
    else:
        level = "low"
    return level, float(score)


def assess_risk(category: str, avg_daily_demand: float, operational_record) -> RiskAssessment:
    days_of_supply = compute_days_of_supply(operational_record.inventory_units, avg_daily_demand)
    stockout_risk = compute_stockout_risk(days_of_supply, operational_record.supplier_lead_time_days)
    expiry_risk = compute_expiry_risk(operational_record.expiry_days_remaining, days_of_supply)
    priority_level, priority_score = compute_patient_impact_priority(
        operational_record.patient_impact_score, stockout_risk
    )

    return RiskAssessment(
        category=category,
        avg_daily_demand=round(avg_daily_demand, 4),
        days_of_supply=round(days_of_supply, 2) if days_of_supply != float("inf") else -1.0,
        stockout_risk=stockout_risk,
        expiry_risk=expiry_risk,
        patient_impact_priority=priority_level,
        priority_score=priority_score,
    )