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


def calculate_reliability_score(entry: dict, stats) -> dict:
    import math
    wape = entry.get("global_wape", entry.get("mean_wape", 100.0))
    mase = entry.get("mean_mase", 1.0)
    picp = entry.get("mean_picp", float("nan"))
    cv2 = stats.cv2

    if wape is None or math.isnan(wape): wape = 100.0
    if mase is None or math.isnan(mase): mase = 1.0

    w_wape = 30.0
    w_mase = 20.0
    w_cv2 = 10.0
    w_class = 10.0
    w_picp = 30.0

    score_wape = w_wape * max(0.0, (1 - wape / 100.0))
    score_mase = w_mase * max(0.0, (1 - mase / 2.0))
    score_cv2 = w_cv2 * max(0.0, (1 - min(cv2, 2.0) / 2.0))
    score_class = w_class * (stats.classification_confidence / 100.0)

    total_weight = w_wape + w_mase + w_cv2 + w_class
    score_sum = score_wape + score_mase + score_cv2 + score_class

    picp_available = picp is not None and not math.isnan(picp)
    if picp_available:
        score_picp = w_picp * max(0.0, min(1.0, (picp / 95.0)))
        score_sum += score_picp
        total_weight += w_picp

    score = (score_sum / total_weight) * 100.0 if total_weight > 0 else 0.0
    score = float(min(100.0, max(0.0, score)))

    return {
        "reliabilityScore": score,
        "picpAvailable": picp_available,
        "meanPicp": picp if picp_available else None,
        "picpTarget": 95.0,
        "picpSampleCount": entry.get("total_interval_evaluations", 0),
        "meanWapePct": wape,
        "meanMase": mase
    }


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

    if hasattr(model, "predict_with_interval") and entry["model_type"] == "sarima":
        # Preserve SARIMA's native statsmodels confidence intervals
        _, lower, upper = model.predict_with_interval(horizon)
        lower_bounds = [max(float(v), 0.0) for v in lower]
        upper_bounds = [float(v) for v in upper]
    else:
        # Out-of-Sample Empirical Quantiles
        step_lower = entry.get("step_lower_residuals")
        step_upper = entry.get("step_upper_residuals")
        
        if step_lower and step_upper:
            available_steps = min(len(step_lower), len(step_upper))
            for i in range(horizon):
                if i < available_steps:
                    lb = max(0.0, float(preds[i] + step_lower[i]))
                    ub = max(0.0, float(preds[i] + step_upper[i]))
                    # Ensure valid interval ordering
                    if lb > ub:
                        lb, ub = ub, lb
                    lower_bounds[i] = lb
                    upper_bounds[i] = ub
                else:
                    # Horizon exceeds empirically calibrated residual steps
                    lower_bounds[i] = None
                    upper_bounds[i] = None

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

    explanation = explain_forecast(model, entry["model_type"])

    rel_info = calculate_reliability_score(entry, stats)
    score = rel_info["reliabilityScore"]
    
    if score >= 80:
        category_level = "High"
        rel_reason = "High confidence due to strong accuracy metrics and high interval coverage."
    elif score >= 50:
        category_level = "Medium"
        rel_reason = f"Moderate confidence. Forecast is influenced by {stats.demand_classification.lower()} demand patterns."
    else:
        category_level = "Low"
        rel_reason = f"Low confidence. Model struggles with {stats.demand_classification.lower()} demand and low interval coverage."

    return {
        "category": category,
        "horizon": horizon,
        "modelType": entry["model_type"],
        "modelVersion": entry["version"],
        "forecast": forecast_points,
        "trend": trend,
        "seasonality": stats.seasonality,
        "confidence": {
            "method": "multi_factor",
            "reliabilityScore": round(score, 2),
            "reliabilityCategory": category_level,
            "reliabilityReason": rel_reason,
            "meanMae": entry.get("mean_mae"),
            "meanWapePct": round(rel_info["meanWapePct"], 2),
            "meanSmapePct": entry.get("mean_smape"),
            "meanRmse": entry.get("mean_rmse"),
            "meanMase": round(rel_info["meanMase"], 4),
            "meanBias": entry.get("mean_bias"),
            "meanTrendAcc": entry.get("mean_trend_acc"),
            "meanPicp": round(rel_info["meanPicp"], 2) if rel_info["picpAvailable"] else None,
            "picpAvailable": rel_info["picpAvailable"],
            "picpTarget": rel_info["picpTarget"],
            "picpSampleCount": rel_info["picpSampleCount"],
            "note": "Multi-factor reliability based on available components: WAPE, MASE, PICP (if available), demand stability, and classification confidence."
        },
        "explanation": explanation,
    }


def generate_quality_report(category: str) -> dict:
    if category not in CATEGORY_COLUMNS:
        raise CategoryNotFoundError(f"'{category}' is not a known category.")

    try:
        model, entry = load_model(category)
    except FileNotFoundError as exc:
        raise ModelNotTrainedError(str(exc)) from exc

    df = load_raw_sales_data()
    series = get_category_series(df, category)
    stats = compute_series_stats(series, category)

    rel_info = calculate_reliability_score(entry, stats)
    score = rel_info["reliabilityScore"]

    if score >= 80:
        category_level = "High"
        rel_reason = "High confidence due to strong accuracy metrics and high interval coverage."
    elif score >= 50:
        category_level = "Medium"
        rel_reason = f"Moderate confidence. Forecast is influenced by {stats.demand_classification.lower()} demand patterns."
    else:
        category_level = "Low"
        rel_reason = f"Low confidence. Model struggles with {stats.demand_classification.lower()} demand and low interval coverage."

    return {
        "category": category,
        "modelType": entry["model_type"],
        "modelVersion": entry["version"],
        "trainedAt": entry["trained_at"],
        "nTrainingRows": entry["n_training_rows"],
        "demandClassification": stats.demand_classification,
        "classificationConfidence": stats.classification_confidence,
        "confidence": {
            "method": "multi_factor",
            "reliabilityScore": round(score, 2),
            "reliabilityCategory": category_level,
            "reliabilityReason": rel_reason,
            "meanMae": entry.get("mean_mae"),
            "meanWapePct": round(rel_info["meanWapePct"], 2),
            "meanSmapePct": entry.get("mean_smape"),
            "meanRmse": entry.get("mean_rmse"),
            "meanMase": round(rel_info["meanMase"], 4),
            "meanBias": entry.get("mean_bias"),
            "meanTrendAcc": entry.get("mean_trend_acc"),
            "meanPicp": round(rel_info["meanPicp"], 2) if rel_info["picpAvailable"] else None,
            "picpAvailable": rel_info["picpAvailable"],
            "picpTarget": rel_info["picpTarget"],
            "picpSampleCount": rel_info["picpSampleCount"],
            "note": "Multi-factor reliability based on available components: WAPE, MASE, PICP (if available), demand stability, and classification confidence."
        }
    }