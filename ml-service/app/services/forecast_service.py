from datetime import date, timedelta
from app.schemas import (
    ForecastRequest, 
    ForecastResponse, 
    ForecastPoint, 
    ModelMetrics, 
    ExplanationItem, 
    RiskResponse, 
    RecommendationResponse
)

def generate_deterministic_forecast(request: ForecastRequest) -> ForecastResponse:
    # Deterministic logic for MVP
    base_sales = 1000.0 if request.category == "R03" else 500.0
    
    forecast_points = []
    start_date = date.today()
    
    for i in range(request.horizon):
        current_date = start_date + timedelta(days=i)
        
        # simple deterministic seasonal effect based on day of week
        seasonal_adj = (current_date.weekday() - 3) * 10
        # simple trend
        trend_adj = i * 2.5
        
        predicted = base_sales + seasonal_adj + trend_adj
        
        forecast_points.append(
            ForecastPoint(
                date=current_date,
                predicted_sales=round(predicted, 2),
                lower_bound=round(predicted * 0.8, 2),
                upper_bound=round(predicted * 1.2, 2)
            )
        )
        
    metrics = ModelMetrics(
        mae=12.5,
        smape=4.2,
        wape=5.1
    )
    
    explanation = [
        ExplanationItem(
            feature="Historical Trend",
            importance=0.6,
            direction="Positive"
        ),
        ExplanationItem(
            feature="Day of Week Seasonality",
            importance=0.3,
            direction="Mixed"
        )
    ]
    
    risk = RiskResponse(
        level="LOW",
        score=0.15,
        type="Volatility",
        reason="Consistent baseline with predictable seasonality."
    )
    
    recommendation = RecommendationResponse(
        strategy="Maintain stock",
        action="Standard replenishment",
        reason="Demand is steady and easily predictable.",
        human_approval_required=False
    )
    
    return ForecastResponse(
        category=request.category,
        model="PSI-MVP-Forecast",
        trend="Slightly increasing",
        seasonality="Weekly",
        confidence_score=0.92,
        forecast=forecast_points,
        metrics=metrics,
        explanation=explanation,
        risk=risk,
        recommendation=recommendation
    )
