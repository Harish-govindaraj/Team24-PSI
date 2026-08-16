"""
Feature engineering for the tree-based forecasters (XGBoost/LightGBM).

Every feature here uses only information available BEFORE the day being
predicted: past lags, trailing rolling windows (shifted so the current
day is excluded), and calendar attributes of the day itself (which are
always known in advance). Nothing here can leak future target values
into a training row - that would make walk-forward validation lie to us.
"""

from __future__ import annotations

import pandas as pd

DEFAULT_LAGS = [1, 7, 14, 28]
DEFAULT_ROLLING_WINDOWS = [7, 14, 28]


def create_lag_features(series: pd.Series, lags: list[int] | None = None) -> pd.DataFrame:
    lags = lags or DEFAULT_LAGS
    out = pd.DataFrame(index=series.index)
    for lag in lags:
        out[f"lag_{lag}"] = series.shift(lag)
    return out


def create_rolling_features(series: pd.Series, windows: list[int] | None = None) -> pd.DataFrame:
    windows = windows or DEFAULT_ROLLING_WINDOWS
    out = pd.DataFrame(index=series.index)
    # shift(1) FIRST so the rolling window for "today" only ever looks
    # at days strictly before today - this is the leak-prevention line.
    shifted = series.shift(1)
    for w in windows:
        out[f"rolling_mean_{w}"] = shifted.rolling(window=w, min_periods=w).mean()
        out[f"rolling_std_{w}"] = shifted.rolling(window=w, min_periods=w).std()
    return out


def create_calendar_features(index: pd.DatetimeIndex) -> pd.DataFrame:
    out = pd.DataFrame(index=index)
    out["day_of_week"] = index.dayofweek
    out["is_weekend"] = (index.dayofweek >= 5).astype(int)
    out["day_of_month"] = index.day
    out["month"] = index.month
    out["day_of_year"] = index.dayofyear
    return out


def build_feature_matrix(
    series: pd.Series, lags: list[int] | None = None, rolling_windows: list[int] | None = None
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Returns (X, y), chronologically ordered and index-aligned, with
    warm-up rows (where lag/rolling features are still NaN because
    there isn't enough history yet) dropped.
    """
    lag_df = create_lag_features(series, lags)
    roll_df = create_rolling_features(series, rolling_windows)
    cal_df = create_calendar_features(series.index)

    X = pd.concat([lag_df, roll_df, cal_df], axis=1)
    y = series.copy()

    valid_mask = X.notna().all(axis=1)
    return X.loc[valid_mask], y.loc[valid_mask]