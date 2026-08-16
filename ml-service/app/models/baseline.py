"""
Statistical baseline forecasters. Every class exposes a
.fit(series) / .predict(horizon) interface identical to the ML models
in ml_models.py, so evaluation.py can score all of them the same way.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX


class NaiveForecaster:
    """Repeats the last observed value for the whole horizon. The floor
    every other model has to beat."""
    name = "naive"

    def fit(self, series: pd.Series) -> "NaiveForecaster":
        self._last_value = float(series.iloc[-1])
        return self

    def predict(self, horizon: int) -> np.ndarray:
        return np.full(horizon, self._last_value)


class SeasonalNaiveForecaster:
    """Repeats the last `season_length` days, cyclically. Strong,
    hard-to-beat baseline for anything with weekly seasonality."""
    name = "seasonal_naive"

    def __init__(self, season_length: int = 7):
        self.season_length = season_length

    def fit(self, series: pd.Series) -> "SeasonalNaiveForecaster":
        self._season_values = series.iloc[-self.season_length:].values
        return self

    def predict(self, horizon: int) -> np.ndarray:
        reps = int(np.ceil(horizon / self.season_length))
        tiled = np.tile(self._season_values, reps)
        return tiled[:horizon]


class ExponentialSmoothingForecaster:
    """Holt-Winters with weekly seasonality; falls back to a simpler
    additive-trend model if there isn't enough data for two full
    seasonal cycles, and to a level-only model if even that fails."""
    name = "exponential_smoothing"

    def __init__(self, seasonal_periods: int = 7):
        self.seasonal_periods = seasonal_periods

    def fit(self, series: pd.Series) -> "ExponentialSmoothingForecaster":
        series = series.clip(lower=0.01)  # additive ETS requires strictly positive values
        try:
            if len(series) >= 2 * self.seasonal_periods:
                model = ExponentialSmoothing(
                    series, trend="add", seasonal="add",
                    seasonal_periods=self.seasonal_periods, initialization_method="estimated",
                )
            else:
                model = ExponentialSmoothing(series, trend="add", initialization_method="estimated")
            self._fitted = model.fit(optimized=True)
        except Exception:
            model = ExponentialSmoothing(series, trend=None, initialization_method="estimated")
            self._fitted = model.fit(optimized=True)
        return self

    def predict(self, horizon: int) -> np.ndarray:
        preds = self._fitted.forecast(horizon).values
        return np.clip(preds, a_min=0, a_max=None)


class SARIMAForecaster:
    """SARIMA(1,1,1)(1,1,1,7) - a fixed weekly-seasonal order, chosen
    for speed and stability across 8 categories x many walk-forward
    folds, rather than an expensive per-fold auto-order search."""
    name = "sarima"

    def __init__(self, order=(1, 1, 1), seasonal_order=(1, 1, 1, 7)):
        self.order = order
        self.seasonal_order = seasonal_order

    def fit(self, series: pd.Series) -> "SARIMAForecaster":
        model = SARIMAX(
            series, order=self.order, seasonal_order=self.seasonal_order,
            enforce_stationarity=False, enforce_invertibility=False,
        )
        self._fitted = model.fit(disp=False)
        return self

    def predict(self, horizon: int) -> np.ndarray:
        preds = self._fitted.forecast(horizon).values
        return np.clip(preds, a_min=0, a_max=None)
    
    def predict_with_interval(self, horizon: int, alpha: float = 0.05):
        """
        Returns (mean, lower, upper) arrays using statsmodels' native
        forecast confidence interval - NOT a made-up spread. alpha=0.05
        gives a 95% interval. Clipped at 0 since negative sales are
        impossible.
        """
        forecast_obj = self._fitted.get_forecast(steps=horizon)
        mean = np.clip(forecast_obj.predicted_mean.values, a_min=0, a_max=None)
        conf_int = forecast_obj.conf_int(alpha=alpha)
        lower = np.clip(conf_int.iloc[:, 0].values, a_min=0, a_max=None)
        upper = np.clip(conf_int.iloc[:, 1].values, a_min=0, a_max=None)
        return mean, lower, upper