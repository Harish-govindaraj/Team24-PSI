"""
Rule-based recommendation engine. Every recommendation carries an
explicit humanApprovalRequired flag (always True in this
implementation) - this system NEVER claims autonomous purchasing
authority, a guarantee against stockouts, or clinical judgment. It
surfaces a strategy + action + reason for a human to review.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Recommendation:
    strategy: str
    action: str
    reason: str
    humanApprovalRequired: bool = True


def build_recommendations(category, trend, seasonality_detected, risk_assessment, operational_record) -> list:
    recs: list[Recommendation] = []

    if risk_assessment.stockout_risk == "high":
        recs.append(Recommendation(
            strategy="Inventory Replenishment",
            action=f"Expedite reorder for {category} - initiate purchase order review",
            reason=(
                f"Projected days of supply ({risk_assessment.days_of_supply}) is below the "
                f"synthetic supplier lead time ({operational_record.supplier_lead_time_days} days). "
                f"Based on real forecast demand and SYNTHETIC inventory/lead-time data - verify "
                f"against the real inventory system before ordering."
            ),
        ))
    elif risk_assessment.stockout_risk == "medium":
        recs.append(Recommendation(
            strategy="Inventory Monitoring",
            action=f"Add {category} to the next reorder review cycle",
            reason="Days of supply is approaching the supplier lead-time threshold; not urgent yet.",
        ))

    if risk_assessment.expiry_risk == "high":
        recs.append(Recommendation(
            strategy="Inventory Redistribution",
            action=f"Consider redistributing or discounting {category} stock before expiry",
            reason=(
                f"Synthetic expiry window ({operational_record.expiry_days_remaining} days) is "
                f"shorter than the projected time to consume current inventory at forecast demand."
            ),
        ))

    if risk_assessment.patient_impact_priority in {"critical", "high"} and risk_assessment.stockout_risk in {"high", "medium"}:
        recs.append(Recommendation(
            strategy="Priority Escalation",
            action=f"Escalate {category} to pharmacy operations lead for manual review",
            reason=(
                f"Synthetic patient-impact priority is '{risk_assessment.patient_impact_priority}' "
                f"combined with '{risk_assessment.stockout_risk}' stockout risk - human judgment "
                f"needed; this is not a clinical assessment."
            ),
        ))

    if trend == "increasing" and risk_assessment.stockout_risk == "low":
        recs.append(Recommendation(
            strategy="Sales & Marketing",
            action=f"Consider supporting the current upward demand trend for {category} with continued marketing",
            reason="Forecast trend is increasing and inventory risk is currently low - confirm this is a genuine demand signal, not noise, before committing marketing spend.",
        ))
    elif trend == "decreasing":
        recs.append(Recommendation(
            strategy="Sales & Marketing",
            action=f"Review promotional spend allocated to {category}",
            reason="Forecast trend is decreasing; continued promotion may not be cost-effective - needs human review of the underlying cause.",
        ))

    if operational_record.substitute_available and risk_assessment.stockout_risk == "high":
        recs.append(Recommendation(
            strategy="Substitution Guidance",
            action=f"Prepare substitute-product guidance for pharmacists for {category}",
            reason="A substitute is flagged as available in the synthetic operational data and stockout risk is high - confirm real substitute availability before communicating to pharmacists.",
        ))

    if not recs:
        recs.append(Recommendation(
            strategy="No Action",
            action=f"No action needed for {category} at this time",
            reason="Current forecast, risk, and synthetic operational signals do not indicate elevated risk.",
        ))

    return recs