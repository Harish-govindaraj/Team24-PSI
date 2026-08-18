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

    def predict_with_interval(self, horizon: int, alpha: float = 0.05):
        mean = self.predict(horizon)
        if hasattr(self._fitted, "resid") and self._fitted.resid is not None:
            resid_std = np.nanstd(self._fitted.resid)
            # 1.96 for 95% interval
            z = 1.96
            # Increase uncertainty over time (sqrt(h) scaling)
            margin = z * resid_std * np.sqrt(np.arange(1, horizon + 1))
            lower = np.clip(mean - margin, 0, None)
            upper = np.clip(mean + margin, 0, None)
            return mean, lower, upper
        return mean, [None]*horizon, [None]*horizon


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


class CrostonForecaster:
    """Croston's method for intermittent demand.
    Separates non-zero demand size and intervals between demands,
    smoothing both independently to predict the average rate.
    """
    name = "croston"

    def __init__(self, alpha: float = 0.1):
        self.alpha = alpha

    def fit(self, series: pd.Series) -> "CrostonForecaster":
        a = series.values
        demand_idx = np.where(a > 0)[0]
        if len(demand_idx) == 0:
            self._rate = 0.0
            self._resid_std = 0.0
            return self

        sizes = a[demand_idx]
        intervals = np.diff(np.insert(demand_idx, 0, -1))

        z = sizes[0]
        p = intervals[0]
        for i in range(1, len(demand_idx)):
            z = self.alpha * sizes[i] + (1 - self.alpha) * z
            p = self.alpha * intervals[i] + (1 - self.alpha) * p

        self._rate = z / p if p > 0 else 0.0
        
        # Calculate naive residuals for intervals
        preds = np.full(len(a), self._rate)
        self._resid_std = np.std(a - preds)
        
        return self

    def predict(self, horizon: int) -> np.ndarray:
        return np.full(horizon, self._rate)

    def predict_with_interval(self, horizon: int, alpha: float = 0.05):
        mean = self.predict(horizon)
        z_val = 1.96
        margin = z_val * getattr(self, "_resid_std", 0.0) * np.sqrt(np.arange(1, horizon + 1))
        lower = np.clip(mean - margin, 0, None)
        upper = mean + margin
        return mean, lower, upper


class CrostonTSBForecaster:
    """Croston TSB method for intermittent demand.
    Updates probability of demand (p) and demand size (z) separately
    at every time step.
    """
    name = "croston_tsb"

    def __init__(self, alpha_p: float = 0.1, alpha_z: float = 0.1):
        self.alpha_p = alpha_p
        self.alpha_z = alpha_z

    def fit(self, series: pd.Series) -> "CrostonTSBForecaster":
        a = series.values
        demand_idx = np.where(a > 0)[0]
        if len(demand_idx) == 0:
            self._rate = 0.0
            self._resid_std = 0.0
            return self

        # Initialize p and z based on the first demand
        z = a[demand_idx[0]]
        p = 1.0 / (demand_idx[0] + 1) if demand_idx[0] >= 0 else 1.0

        for i in range(1, len(a)):
            if a[i] > 0:
                z = self.alpha_z * a[i] + (1 - self.alpha_z) * z
                p = self.alpha_p * 1.0 + (1 - self.alpha_p) * p
            else:
                p = (1 - self.alpha_p) * p
                # z is not updated when there is no demand

        self._rate = p * z
        
        # Calculate naive residuals
        preds = np.full(len(a), self._rate)
        self._resid_std = np.std(a - preds)
        
        return self

    def predict(self, horizon: int) -> np.ndarray:
        return np.full(horizon, self._rate)

    def predict_with_interval(self, horizon: int, alpha: float = 0.05):
        mean = self.predict(horizon)
        z_val = 1.96
        margin = z_val * getattr(self, "_resid_std", 0.0) * np.sqrt(np.arange(1, horizon + 1))
        lower = np.clip(mean - margin, 0, None)
        upper = mean + margin
        return mean, lower, upper