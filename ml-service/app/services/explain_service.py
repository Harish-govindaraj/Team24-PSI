"""
SHAP explanations for tree-based forecasters ONLY. SHAP attributes a
prediction to input features - it has no meaning for the statistical
baselines (naive, seasonal_naive, exponential_smoothing, sarima),
which don't use engineered features at all. Calling this on a
non-tree model returns an explicit "not applicable" result instead of
fabricating an explanation for a model that has none.
"""

from __future__ import annotations

import numpy as np
import shap

TREE_MODEL_TYPES = {"xgboost", "lightgbm"}


def explain_forecast(model, model_type: str) -> dict:
    if model_type not in TREE_MODEL_TYPES:
        return {
            "available": False,
            "reason": (
                f"SHAP explanations are only implemented for feature-based "
                f"models (xgboost/lightgbm). The active model for this "
                f"category is '{model_type}', a statistical time-series "
                f"model with no engineered feature inputs to attribute "
                f"a prediction to."
            ),
        }

    features = getattr(model, "_last_prediction_features", None)
    if features is None or len(features) == 0:
        return {
            "available": False,
            "reason": "No prediction features were captured for this forecast.",
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