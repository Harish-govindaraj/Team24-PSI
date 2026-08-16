"""
Orchestrates a single /forecast request:
  1. Validate the category is a real one.
  2. Load the currently-registered model for it (Step 2's registry -
     NEVER trains at request time).
  3. Generate predictions + bounds where statistically defensible.
  4. Attach trend/seasonality context from Step 1's real stats.
  5. Attach a SHAP explanation where applicable (Part 6).
"""

from __future__ import annotations

import pandas as pd

from app.models.registry import load_model
from app.services.explain_service import explain_forecast
from app.utils.data_loader import CATEGORY_COLUMNS, get_category_series, load_raw_sales_data
from app.utils.stats import compute_series_stats


class CategoryNotFoundError(Exception):
    pass


class ModelNotTrainedError(Exception):
    pass


def generate_forecast(category: str, horizon: int) -> dict:
    if category not in CATEGORY_COLUMNS:
        raise CategoryNotFoundError(
            f"'{category}' is not a known category. Valid categories: {CATEGORY_COLUMNS}"
        )

    try:
        model, entry = load_model(category)
    except FileNotFoundError as exc:
        raise ModelNotTrainedError(str(exc)) from exc

    df = load_raw_sales_data()
    series = get_category_series(df, category)
    stats = compute_series_stats(series, category)

    preds = model.predict(horizon)
    preds = [max(float(p), 0.0) for p in preds]

    lower_bounds = [None] * horizon
    upper_bounds = [None] * horizon
    if hasattr(model, "predict_with_interval"):
        _, lower, upper = model.predict_with_interval(horizon)
        lower_bounds = [max(float(v), 0.0) for v in lower]
        upper_bounds = [float(v) for v in upper]

    last_date = series.index[-1]
    forecast_points = []
    for i in range(horizon):
        forecast_points.append({
            "day": i + 1,
            "date": (last_date + pd.Timedelta(days=i + 1)).strftime("%Y-%m-%d"),
            "predictedSales": round(preds[i], 4),
            "lowerBound": round(lower_bounds[i], 4) if lower_bounds[i] is not None else None,
            "upperBound": round(upper_bounds[i], 4) if upper_bounds[i] is not None else None,
        })

    trend = "increasing" if stats.trend_slope > 0.01 else "decreasing" if stats.trend_slope < -0.01 else "stable"
    seasonality_detected = bool(stats.seasonal_strength is not None and stats.seasonal_strength > 0.1)

    explanation = explain_forecast(model, entry["model_type"])

    return {
        "category": category,
        "horizon": horizon,
        "modelType": entry["model_type"],
        "modelVersion": entry["version"],
        "forecast": forecast_points,
        "trend": trend,
        "seasonalityDetected": seasonality_detected,
        "confidence": {
            "method": "walk_forward_wape",
            "meanMae": entry["mean_mae"],
            "meanWapePct": entry["mean_wape"],
            "meanSmapePct": entry["mean_smape"],
            "note": (
                "meanWapePct/meanSmapePct are this model's measured error "
                "rate from Step 2's walk-forward validation on historical "
                "data - not a guarantee about this specific forecast."
            ),
        },
        "explanation": explanation,
    }