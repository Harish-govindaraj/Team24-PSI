from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class ForecastRequest(BaseModel):
    category: str
    horizon: int

class ForecastPoint(BaseModel):
    date: date
    predicted_sales: float
    lower_bound: float
    upper_bound: float

class ModelMetrics(BaseModel):
    mae: float
    smape: float
    wape: float

class ExplanationItem(BaseModel):
    feature: str
    importance: float
    direction: str

class RiskResponse(BaseModel):
    level: str
    score: float
    type: str
    reason: str

class RecommendationResponse(BaseModel):
    strategy: str
    action: str
    reason: str
    human_approval_required: bool

class ForecastResponse(BaseModel):
    category: str
    model: str
    trend: str
    seasonality: str
    confidence_score: float
    forecast: List[ForecastPoint]
    metrics: ModelMetrics
    explanation: List[ExplanationItem]
    risk: RiskResponse
    recommendation: RecommendationResponse
