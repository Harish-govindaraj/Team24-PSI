"""
Descriptive and time-series statistics for a single drug category's
sales series. Every number here is computed directly from the real
data - nothing here is estimated, guessed, or hardcoded. This module
is what Step 2's model comparison and Step 3's forecast-quality output
will build on.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose


@dataclass
class SeriesStats:
    category: str
    n_observations: int
    mean: float
    median: float
    variance: float
    std_dev: float
    zero_demand_pct: float
    trend_slope: float
    seasonal_strength: float | None
    volatility_cv: float
    adi: float
    cv2: float
    demand_classification: str
    classification_confidence: float


def _trend_slope(series: pd.Series) -> float:
    """
    Simple linear trend: fit y = a*x + b over the whole series, return
    the slope 'a'. Positive = sales trending up over time, negative =
    trending down, near-zero = flat.
    """
    y = series.values.astype(float)
    x = np.arange(len(y))
    if len(y) < 2:
        return 0.0
    slope, _intercept = np.polyfit(x, y, 1)
    return float(slope)


def _seasonal_strength(series: pd.Series, period: int = 7) -> float | None:
    """
    Uses statsmodels' classical seasonal_decompose (additive) over a
    weekly period (pharmacy sales are strongly day-of-week driven).
    Returns a 0-1 strength score: variance of the seasonal component
    relative to variance of (seasonal + residual). Returns None if
    there isn't enough data to decompose (needs at least 2 full
    periods).
    """
    if len(series) < period * 2:
        return None
    try:
        result = seasonal_decompose(series, model="additive", period=period, extrapolate_trend="freq")
    except Exception:
        return None

    seasonal_var = np.nanvar(result.seasonal)
    resid_var = np.nanvar(result.resid)
    denom = seasonal_var + resid_var
    if denom == 0:
        return 0.0
    return float(round(seasonal_var / denom, 4))


def compute_series_stats(series: pd.Series, category: str) -> SeriesStats:
    """
    series must be a pandas Series of daily sales values, indexed by
    date, already sorted chronologically (this is guaranteed if the
    series came from data_loader.get_category_series on a DataFrame
    that went through load_raw_sales_data).
    """
    series = series.dropna()
    mean = float(series.mean())
    std = float(series.std())
    n_obs = len(series)
    
    volatility_cv = std / mean if mean != 0 else float("inf")
    cv2 = volatility_cv ** 2
    
    non_zero_count = (series > 0).sum()
    adi = n_obs / non_zero_count if non_zero_count > 0 else float("inf")
    
    # Syntetos, Boylan and Croston (2005) classification
    if adi < 1.32 and cv2 < 0.49:
        classification = "Stable"
    elif adi >= 1.32 and cv2 < 0.49:
        classification = "Intermittent"
    else:
        # cv2 >= 0.49 (Erratic or Lumpy) -> mapped to Volatile
        classification = "Volatile"
        
    # Calculate a normalized confidence score based on distance to boundaries
    # boundary distances:
    adi_dist = abs(adi - 1.32) / 1.32
    cv2_dist = abs(cv2 - 0.49) / 0.49
    # The further away from the boundary, the higher the confidence.
    # Cap distances at 1.0, take average, scale to 0-100.
    confidence = float(min(100.0, ((min(1.0, adi_dist) + min(1.0, cv2_dist)) / 2.0) * 100))

    return SeriesStats(
        category=category,
        n_observations=int(n_obs),
        mean=round(mean, 4),
        median=round(float(series.median()), 4),
        variance=round(float(series.var()), 4),
        std_dev=round(std, 4),
        zero_demand_pct=round(100 * float((series == 0).mean()), 2),
        trend_slope=round(_trend_slope(series), 6),
        seasonal_strength=_seasonal_strength(series),
        volatility_cv=round(volatility_cv, 4),
        adi=round(adi, 4),
        cv2=round(cv2, 4),
        demand_classification=classification,
        classification_confidence=round(confidence, 2)
    )


def compute_all_category_stats(df: pd.DataFrame, category_columns: list[str]) -> dict[str, SeriesStats]:
    """
    Convenience wrapper: computes SeriesStats for every category column
    present in df, keyed by category name. Uses the date column as the
    index for decomposition to work correctly.
    """
    from app.utils.data_loader import DATE_COLUMN  # local import avoids a cycle

    indexed = df.set_index(DATE_COLUMN)
    results = {}
    for col in category_columns:
        if col not in indexed.columns:
            continue
        results[col] = compute_series_stats(indexed[col], col)
    return results