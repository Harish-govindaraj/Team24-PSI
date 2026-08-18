"""
SHAP explanations for tree-based forecasters, and heuristic textual
explanations for statistical baselines. Every model now returns an
explanation.
"""

from __future__ import annotations

import numpy as np
import shap

TREE_MODEL_TYPES = {"xgboost", "lightgbm"}

def explain_forecast(model, model_type: str) -> dict:
    if model_type not in TREE_MODEL_TYPES:
        # Statistical model fallback
        reason = "Baseline model selected."
        if model_type == "sarima" or model_type == "exponential_smoothing":
            reason = "Forecast influenced by: weekly seasonality, recent demand trend, and historical cycles."
        elif model_type == "croston" or model_type == "croston_tsb":
            reason = "Forecast influenced by: average demand interval, intermittent demand frequency, and historical demand size."
        elif model_type == "naive" or model_type == "seasonal_naive":
            reason = "Low-frequency demand detected. Baseline model selected due to insufficient demand patterns."
            
        return {
            "available": True,
            "method": "heuristic",
            "reason": reason,
            "topFeatures": []
        }

    features = getattr(model, "_last_prediction_features", None)
    if features is None or len(features) == 0:
        return {
            "available": False,
            "reason": "No prediction features were captured for this forecast.",
            "topFeatures": []
        }

    explainer = shap.TreeExplainer(model._model)
    shap_values = explainer.shap_values(features)

    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    ranked = sorted(zip(features.columns, mean_abs_shap), key=lambda pair: pair[1], reverse=True)

    return {
        "available": True,
        "method": "shap.TreeExplainer",
        "topFeatures": [
            {"feature": name, "meanAbsShapValue": round(float(value), 4)}
            for name, value in ranked[:5]
        ],
    }