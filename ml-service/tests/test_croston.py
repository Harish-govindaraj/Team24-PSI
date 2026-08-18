import numpy as np
import pandas as pd
from app.models.baseline import CrostonForecaster


def test_croston_all_zeros():
    model = CrostonForecaster()
    series = pd.Series([0, 0, 0, 0, 0])
    model.fit(series)
    preds = model.predict(7)
    assert len(preds) == 7
    assert all(p >= 0 for p in preds)
    assert all(np.isfinite(p) for p in preds)
    assert all(p == 0 for p in preds)


def test_croston_one_nonzero():
    model = CrostonForecaster()
    series = pd.Series([0, 0, 5, 0, 0])
    model.fit(series)
    preds = model.predict(3)
    assert len(preds) == 3
    assert all(p >= 0 for p in preds)
    assert all(np.isfinite(p) for p in preds)
    assert all(p > 0 for p in preds)


def test_croston_dense():
    model = CrostonForecaster()
    series = pd.Series([5, 6, 4, 5, 7, 6, 5])
    model.fit(series)
    preds = model.predict(5)
    assert len(preds) == 5
    assert all(p > 0 for p in preds)
    assert all(np.isfinite(p) for p in preds)


def test_croston_consecutive_nonzeros():
    model = CrostonForecaster()
    series = pd.Series([0, 0, 3, 4, 0, 0, 5, 6])
    model.fit(series)
    preds = model.predict(2)
    assert len(preds) == 2
    assert all(p >= 0 for p in preds)
    assert all(np.isfinite(p) for p in preds)
