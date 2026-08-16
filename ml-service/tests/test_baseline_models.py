import numpy as np
import pandas as pd

from app.models.baseline import NaiveForecaster, SeasonalNaiveForecaster


def test_naive_forecaster_repeats_last_value():
    dates = pd.date_range("2024-01-01", periods=30)
    series = pd.Series(np.arange(30, dtype=float), index=dates)
    model = NaiveForecaster().fit(series)
    preds = model.predict(5)
    assert np.all(preds == series.iloc[-1])


def test_seasonal_naive_repeats_last_week():
    dates = pd.date_range("2024-01-01", periods=21)
    series = pd.Series(np.arange(21, dtype=float), index=dates)
    model = SeasonalNaiveForecaster(season_length=7).fit(series)
    preds = model.predict(7)
    np.testing.assert_array_equal(preds, series.iloc[-7:].values)