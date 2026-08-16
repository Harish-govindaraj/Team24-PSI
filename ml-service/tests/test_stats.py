import numpy as np
import pandas as pd
import pytest

from app.utils.stats import compute_series_stats, compute_all_category_stats
from app.utils.data_loader import load_raw_sales_data, CATEGORY_COLUMNS


def test_compute_series_stats_on_synthetic_series():
    dates = pd.date_range("2024-01-01", periods=30)
    values = pd.Series(np.arange(30, dtype=float), index=dates)  # perfectly increasing, 0..29
    result = compute_series_stats(values, category="TEST")

    assert result.n_observations == 30
    assert abs(result.mean - 14.5) < 1e-3
    assert result.trend_slope > 0  # strictly increasing series -> positive slope
    assert result.zero_demand_pct == pytest.approx(100 / 30, rel=1e-2)  # only the value 0 counts as zero-demand


def test_compute_series_stats_zero_demand_percentage():
    dates = pd.date_range("2024-01-01", periods=10)
    values = pd.Series([0, 0, 0, 5, 5, 0, 0, 0, 5, 5], index=dates, dtype=float)
    result = compute_series_stats(values, category="TEST")
    assert result.zero_demand_pct == 60.0


def test_compute_all_category_stats_on_real_data():
    df = load_raw_sales_data()
    existing = [c for c in CATEGORY_COLUMNS if c in df.columns]
    all_stats = compute_all_category_stats(df, existing)

    assert set(all_stats.keys()) == set(existing)
    for cat, s in all_stats.items():
        assert s.n_observations > 0
        assert s.std_dev >= 0
        assert 0 <= s.zero_demand_pct <= 100