"""
Tree-based forecasters (XGBoost, LightGBM). These use RECURSIVE
multi-step forecasting: predict day 1, append that prediction to the
history, recompute lag/rolling features including the new prediction,
predict day 2, and so on. This is required because lag/rolling
features for future days don't exist yet as real data - only as our
own prior predictions.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import xgboost as xgb
import lightgbm as lgb

from app.utils.features import build_feature_matrix


class _RecursiveTreeForecaster:
    """Shared recursive-forecast plumbing for XGBoost and LightGBM.
    Subclasses just set self._model and self.name in __init__."""

    def fit(self, series: pd.Series) -> "_RecursiveTreeForecaster":
        self._history = series.copy()
        X, y = build_feature_matrix(series)
        if len(X) < 20:
            raise ValueError(
                f"Not enough data after feature warm-up to train {self.name}: "
                f"{len(X)} usable rows (need >= 20). Series length was {len(series)}."
            )
        self._model.fit(X, y)
        self._feature_columns = X.columns.tolist()
        return self

    def predict(self, horizon: int) -> np.ndarray:
        history = self._history.copy()
        preds = []
        feature_rows = []
        future_dates = pd.date_range(history.index[-1] + pd.Timedelta(days=1), periods=horizon, freq="D")
        for date in future_dates:
            extended = pd.concat([history, pd.Series([np.nan], index=[date])])
            X, _ = build_feature_matrix(extended)
            x_last = X.iloc[[-1]][self._feature_columns]
            pred = max(float(self._model.predict(x_last)[0]), 0.0)
            preds.append(pred)
            feature_rows.append(x_last)
            history.loc[date] = pred

        self._last_prediction_features = pd.concat(feature_rows) if feature_rows else None
        return np.array(preds)


class XGBoostForecaster(_RecursiveTreeForecaster):
    name = "xgboost"

    def __init__(self, **kwargs):
        params = dict(n_estimators=200, max_depth=4, learning_rate=0.05, objective="reg:squarederror", random_state=42)
        params.update(kwargs)
        self._model = xgb.XGBRegressor(**params)


class LightGBMForecaster(_RecursiveTreeForecaster):
    name = "lightgbm"

    def __init__(self, **kwargs):
        params = dict(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42, verbosity=-1)
        params.update(kwargs)
        self._model = lgb.LGBMRegressor(**params)