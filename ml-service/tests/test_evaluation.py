import numpy as np
import pandas as pd
import pytest

from app.models.evaluation import mae, smape, wape, walk_forward_splits, evaluate_model_walk_forward


def test_mae_basic():
    assert mae([1, 2, 3], [1, 2, 3]) == 0.0
    assert mae([0, 0], [1, 1]) == 1.0


def test_smape_zero_when_equal_and_handles_double_zero():
    assert smape([5, 5], [5, 5]) == 0.0
    assert smape([0, 0], [0, 0]) == 0.0


def test_wape_zero_actual_edge_case():
    result = wape([0, 0, 0], [1, 1, 1])
    assert result == pytest.approx(3.0)


def test_walk_forward_splits_never_overlap_or_gap():
    splits = list(walk_forward_splits(n=50, initial_train_size=20, horizon=5, step=10))
    assert len(splits) > 0
    for train_end, test_start, test_end in splits:
        assert test_start == train_end
        assert test_end - test_start == 5
        assert test_end <= 50


class _ConstantModel:
    def fit(self, series):
        self._value = float(series.iloc[-1])
        return self

    def predict(self, horizon):
        return np.full(horizon, self._value)


def test_evaluate_model_walk_forward_produces_folds():
    dates = pd.date_range("2023-01-01", periods=200)
    series = pd.Series(np.arange(200, dtype=float) % 10, index=dates)
    result = evaluate_model_walk_forward(
        lambda: _ConstantModel(), series, model_name="constant", category="TEST",
        initial_train_size=100, horizon=7, step=14,
    )
    assert len(result.folds) > 0
    assert result.mean_wape >= 0