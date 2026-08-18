import numpy as np
import pandas as pd
import pytest

from app.models.evaluation import mae, smape, wape, walk_forward_splits, evaluate_model_walk_forward, picp


def test_mae_basic():
    assert mae([1, 2, 3], [1, 2, 3]) == 0.0
    assert mae([0, 0], [1, 1]) == 1.0


def test_smape_zero_when_equal_and_handles_double_zero():
    assert smape([5, 5], [5, 5]) == 0.0
    assert smape([0, 0], [0, 0]) == 0.0


def test_wape_zero_actual_edge_case():
    result = wape([0, 0, 0], [1, 1, 1])
    assert np.isnan(result)


def test_global_wape_calculation():
    from app.models.evaluation import WalkForwardResult, FoldResult
    res = WalkForwardResult("test", "CAT")
    res.folds.append(FoldResult(0, 10, 5, 1.0, 10.0, 100.0, rmse=1.0, mase=1.0, bias=0.0, trend_acc=100.0, picp=100.0, actual_sum=10.0, absolute_error_sum=2.0))
    res.folds.append(FoldResult(1, 10, 5, 2.0, 20.0, 50.0, rmse=2.0, mase=2.0, bias=0.0, trend_acc=100.0, picp=100.0, actual_sum=10.0, absolute_error_sum=3.0))
    # global WAPE = sum(absolute_error) / sum(actual) = 5.0 / 20.0 = 25%
    assert res.global_wape == 25.0


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
    assert result.global_wape >= 0


# =====================================================================
# PICP edge cases
# =====================================================================

def test_picp_all_covered():
    # Test 1: All intervals cover actuals -> PICP = 100.0
    val, valid, covered = picp([5, 10, 15], [0, 5, 10], [10, 15, 20])
    assert val == 100.0
    assert valid == 3
    assert covered == 3

def test_picp_none_covered():
    # Test 2: No intervals cover actuals -> PICP = 0.0
    val, valid, covered = picp([5, 10, 15], [20, 30, 40], [30, 40, 50])
    assert val == 0.0
    assert valid == 3
    assert covered == 0

def test_picp_50_percent_coverage():
    # Test 3: 50% coverage
    val, valid, covered = picp([5, 50], [0, 0], [10, 10])
    assert val == 50.0
    assert valid == 2
    assert covered == 1

def test_picp_missing_intervals_excluded():
    # Test 4 & 6: Missing intervals excluded from denominator
    val, valid, covered = picp([5, 10, 15], [0, np.nan, 10], [10, np.nan, 20])
    assert val == 100.0
    assert valid == 2
    assert covered == 2

def test_picp_nan_actual_excluded():
    # Test 5: NaN actual
    val, valid, covered = picp([5, np.nan, 15], [0, 5, 10], [10, 15, 20])
    assert val == 100.0
    assert valid == 2
    assert covered == 2

def test_picp_lower_bound_equality():
    # Test 7: Actual == lower -> covered
    val, valid, covered = picp([5.0], [5.0], [10.0])
    assert val == 100.0
    assert covered == 1

def test_picp_upper_bound_equality():
    # Test 8: Actual == upper -> covered
    val, valid, covered = picp([10.0], [5.0], [10.0])
    assert val == 100.0
    assert covered == 1

def test_picp_infinite_interval():
    # Test 10: Infinite interval excluded
    val, valid, covered = picp([5, 10], [0, -np.inf], [10, np.inf])
    assert val == 100.0
    assert valid == 1
    assert covered == 1

def test_picp_zero_demand_series():
    # Test 9: Zero-demand series does not crash
    val, valid, covered = picp([0, 0, 0], [0, 0, 0], [0, 0, 0])
    assert val == 100.0
    assert valid == 3

def test_picp_highly_intermittent():
    # Test 10: Intermittent series
    val, valid, covered = picp([0, 0, 5, 0], [0, 0, 0, 0], [1, 1, 2, 1])
    assert val == 75.0
    assert valid == 4
    assert covered == 3

def test_picp_leakage_protection():
    # Test 11: Leakage protection
    # We construct a scenario where a later fold has massive residuals.
    # We verify the earlier fold doesn't use those residuals for intervals.
    class _LeakageModel:
        def fit(self, series):
            self.last = float(series.iloc[-1])
            return self
            
        def predict(self, horizon):
            return np.full(horizon, self.last)

    # First fold: target is 5, model predicts 5. Residual = 0
    # Second fold: target is 10, model predicts 5. Residual = 5
    # Third fold: target is 100, model predicts 10. Residual = 90
    dates = pd.date_range("2023-01-01", periods=30)
    data = np.zeros(30)
    data[0:15] = 5
    data[15:20] = 5
    data[20:30] = 100 # massive spike
    
    series = pd.Series(data, index=dates)
    res = evaluate_model_walk_forward(_LeakageModel, series, "test", "CAT", 10, 5, 5, max_folds=4)
    
    # Fold 1 evaluation: interval should be NaN because we have 0 past residuals (it's the first fold)
    f1 = res.folds[0]
    assert f1.valid_interval_count == 0
    assert np.isnan(f1.picp)
    
    # Fold 2 evaluation: interval should be NaN because we have 1 past residual (< 2 minimum)
    f2 = res.folds[1]
    assert f2.valid_interval_count == 0
    
    # Fold 3 evaluation: uses residuals from Fold 1 and Fold 2. 
    # Fold 1 & 2 targets were 5, pred was 5. Residuals = [0, 0].
    # So bounds are [pred+0, pred+0] -> [10,10] since Fold 3 pred is 10 (target 20-30 are 100, wait, Fold 3 train_end is 20, last is 5, pred is 5! But wait, train_end is 20, so series.iloc[19] = 5. So pred=5.
    # Actually train_end=20, index 19 is 5. So pred=5.
    # Target is 100.
    f3 = res.folds[2]
    assert f3.valid_interval_count == 5
    assert f3.covered_count == 0 # Target is 100, interval is [5, 5]

def test_reliability_score_missing_picp():
    # Test 12: Reliability score explicitly tested without penalizing NaN
    from app.services.forecast_service import calculate_reliability_score
    from dataclasses import dataclass
    
    @dataclass
    class MockStats:
        cv2: float = 0.5
        classification_confidence: float = 90.0

    entry_with_nan_picp = {
        "mean_wape": 50.0,
        "mean_mase": 1.0,
        "mean_picp": float("nan")
    }
    
    stats = MockStats()
    res = calculate_reliability_score(entry_with_nan_picp, stats)
    
    assert not res["picpAvailable"]
    assert res["meanPicp"] is None
    assert abs(res["reliabilityScore"] - 59.28) < 0.1

def test_reliability_score_valid_picp():
    from app.services.forecast_service import calculate_reliability_score
    from dataclasses import dataclass
    
    @dataclass
    class MockStats:
        cv2: float = 0.5
        classification_confidence: float = 90.0

    entry_with_valid_picp = {
        "mean_wape": 50.0,
        "mean_mase": 1.0,
        "mean_picp": 95.0
    }
    
    stats = MockStats()
    res = calculate_reliability_score(entry_with_valid_picp, stats)
    
    assert res["picpAvailable"]
    assert res["meanPicp"] == 95.0
    assert abs(res["reliabilityScore"] - 71.5) < 0.1