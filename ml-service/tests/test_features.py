import numpy as np
import pandas as pd

from app.utils.features import create_lag_features, create_rolling_features, create_calendar_features, build_feature_matrix


def _sample_series():
    dates = pd.date_range("2024-01-01", periods=60)
    return pd.Series(np.arange(60, dtype=float), index=dates)


def test_lag_features_shift_correctly():
    series = _sample_series()
    lags = create_lag_features(series, lags=[1, 7])
    assert lags["lag_1"].iloc[10] == series.iloc[9]
    assert lags["lag_7"].iloc[10] == series.iloc[3]


def test_rolling_features_exclude_current_day():
    series = _sample_series()
    rolling = create_rolling_features(series, windows=[7])
    expected = series.iloc[3:10].mean()  # the 7 days strictly BEFORE position 10
    assert abs(rolling["rolling_mean_7"].iloc[10] - expected) < 1e-9


def test_calendar_features_shapes():
    series = _sample_series()
    cal = create_calendar_features(series.index)
    assert set(cal.columns) == {"day_of_week", "is_weekend", "day_of_month", "month", "day_of_year"}
    assert cal["is_weekend"].isin([0, 1]).all()


def test_build_feature_matrix_drops_warmup_and_stays_aligned():
    series = _sample_series()
    X, y = build_feature_matrix(series)
    assert len(X) == len(y)
    assert X.index.equals(y.index)
    assert X.notna().all().all()
    assert len(X) < len(series)