"""
Request/response contracts for Step 4's three new endpoints. Kept in
a separate file from Step 3's app/schemas.py since these are a
distinct concern (decision intelligence vs. raw forecasting).
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class OperationalRecordResponse(BaseModel):
    category: str
    inventory_units: int
    reorder_point_units: int
    supplier_lead_time_days: int
    expiry_days_remaining: int
    patient_impact_score: int
    substitute_available: bool
    region: str
    unit_price_inr: float
    promotion_active: bool
    is_synthetic: bool
    disclaimer: str


class RiskAssessmentResponse(BaseModel):
    category: str
    avg_daily_demand: float
    days_of_supply: float  # -1.0 means "effectively infinite"
    stockout_risk: str
    expiry_risk: str
    patient_impact_priority: str
    priority_score: float


class RecommendationResponse(BaseModel):
    strategy: str
    action: str
    reason: str
    humanApprovalRequired: bool


class DecisionIntelligenceResponse(BaseModel):
    category: str
    horizon: int
    forecastSummary: dict
    riskAssessment: RiskAssessmentResponse
    operationalData: OperationalRecordResponse
    recommendations: list[RecommendationResponse]
    dataDisclaimer: str


class ScenarioRequest(BaseModel):
    category: str = Field(..., min_length=1)
    horizon: int = Field(7, ge=1, le=90)
    supplyShockPct: float = Field(0.0, ge=0.0, le=0.95, description="Fraction of supply lost, e.g. 0.3 = 30% cut")
    nSimulations: int = Field(200, ge=50, le=2000)


class ScenarioResponse(BaseModel):
    category: str
    nSimulations: int
    supplyShockPct: float
    stockoutProbability: float
    meanShortfallUnits: float
    note: str