"""
Request/response contracts for the PSI ML service API. Pydantic
enforces these at the boundary - invalid input never reaches
forecast_service.py.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class SeasonalityInfo(BaseModel):
    type: str
    period: Optional[int] = None
    strength: Optional[float] = None
    detected: bool


class ForecastRequest(BaseModel):
    category: str = Field(..., min_length=1, description="Drug category code, e.g. 'R03'")
    horizon: int = Field(..., ge=1, le=365, description="Days to forecast, 1-365")

    @field_validator("category")
    @classmethod
    def category_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("category must not be empty")
        return v


class ForecastPoint(BaseModel):
    day: int
    date: str
    predictedSales: float
    lowerBound: Optional[float] = None
    upperBound: Optional[float] = None


class ConfidenceInfo(BaseModel):
    method: str
    reliabilityScore: Optional[float] = None
    reliabilityCategory: Optional[str] = None
    reliabilityReason: Optional[str] = None
    meanMae: Optional[float] = None
    meanWapePct: Optional[float] = None
    meanSmapePct: Optional[float] = None
    meanRmse: Optional[float] = None
    meanMase: Optional[float] = None
    meanBias: Optional[float] = None
    meanTrendAcc: Optional[float] = None
    meanPicp: Optional[float] = None
    picpAvailable: Optional[bool] = None
    picpTarget: Optional[float] = None
    picpSampleCount: Optional[int] = None
    note: str


class ExplanationFeature(BaseModel):
    feature: str
    meanAbsShapValue: float


class Explanation(BaseModel):
    available: bool
    method: Optional[str] = None
    reason: Optional[str] = None
    topFeatures: Optional[list[ExplanationFeature]] = None


class ForecastResponse(BaseModel):
    category: str
    horizon: int
    modelType: str
    modelVersion: str
    forecast: list[ForecastPoint]
    trend: str
    seasonality: SeasonalityInfo
    confidence: ConfidenceInfo
    explanation: Explanation


class QualityReportResponse(BaseModel):
    category: str
    modelType: str
    modelVersion: str
    trainedAt: str
    nTrainingRows: int
    demandClassification: str
    classificationConfidence: float
    confidence: ConfidenceInfo


class HealthResponse(BaseModel):
    status: str
    modelsRegistered: int
    categories: list[str]


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail