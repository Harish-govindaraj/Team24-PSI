"""
Evaluation metrics and walk-forward (expanding-window) cross-validation.

NEVER use a random train/test split on time-series data - it lets the
model "see" data chronologically after the test window during training,
which silently inflates every score. Every split function here respects
chronological order: train always ends exactly where test begins.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd


def mae(y_true, y_pred) -> float:
    return float(np.mean(np.abs(np.asarray(y_true, dtype=float) - np.asarray(y_pred, dtype=float))))


def smape(y_true, y_pred) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    denom = np.abs(y_true) + np.abs(y_pred)
    denom = np.where(denom == 0, 1.0, denom)  # both zero -> 0 error, avoid 0/0
    return float(200.0 * np.mean(np.abs(y_pred - y_true) / denom))


def wape(y_true, y_pred) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    total_actual = np.sum(np.abs(y_true))
    if total_actual == 0:
        return float('nan')  # Undefined when total actual demand is 0
    return float(100.0 * np.sum(np.abs(y_true - y_pred)) / total_actual)


def rmse(y_true, y_pred) -> float:
    return float(np.sqrt(np.mean(np.square(np.asarray(y_true, dtype=float) - np.asarray(y_pred, dtype=float)))))

def mase(y_true, y_pred, y_train) -> float:
    y_train = np.asarray(y_train, dtype=float)
    if len(y_train) < 2:
        return float('nan')
    naive_mae = np.mean(np.abs(y_train[1:] - y_train[:-1]))
    if naive_mae == 0:
        return float('nan')
    return float(mae(y_true, y_pred) / naive_mae)

def bias(y_true, y_pred) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    total_actual = np.sum(y_true)
    if total_actual == 0:
        return float('nan')
    return float(100.0 * np.sum(y_pred - y_true) / total_actual)

def trend_accuracy(y_true, y_pred) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    if len(y_true) < 2:
        return float('nan')
    true_diff = np.sign(y_true[1:] - y_true[:-1])
    pred_diff = np.sign(y_pred[1:] - y_pred[:-1])
    return float(100.0 * np.mean(true_diff == pred_diff))

def picp(y_true, y_lower, y_upper) -> tuple[float, int, int]:
    if y_lower is None or y_upper is None:
        return float('nan'), 0, 0
        
    y_true = np.asarray(y_true, dtype=float)
    y_lower = np.asarray(y_lower, dtype=float)
    y_upper = np.asarray(y_upper, dtype=float)
    
    valid_mask = ~np.isnan(y_true) & ~np.isnan(y_lower) & ~np.isnan(y_upper) & ~np.isinf(y_lower) & ~np.isinf(y_upper)
    valid_count = int(np.sum(valid_mask))
    
    if valid_count == 0:
        return float('nan'), 0, 0
        
    coverage = (y_true[valid_mask] >= y_lower[valid_mask]) & (y_true[valid_mask] <= y_upper[valid_mask])
    covered_count = int(np.sum(coverage))
    
    return float(100.0 * covered_count / valid_count), valid_count, covered_count


@dataclass
class FoldResult:
    fold_index: int
    train_size: int
    test_size: int
    mae: float
    smape: float
    wape: float
    rmse: float
    mase: float
    bias: float
    trend_acc: float
    picp: float
    actual_sum: float
    absolute_error_sum: float
    interval_count: int = 0
    covered_count: int = 0
    valid_interval_count: int = 0


@dataclass
class WalkForwardResult:
    model_name: str
    category: str
    folds: list = field(default_factory=list)
    step_lower_residuals: list[float] | None = None
    step_upper_residuals: list[float] | None = None

    @property
    def mean_mae(self) -> float:
        return float(np.mean([f.mae for f in self.folds])) if self.folds else float("nan")

    @property
    def mean_smape(self) -> float:
        return float(np.mean([f.smape for f in self.folds])) if self.folds else float("nan")
        
    @property
    def mean_rmse(self) -> float:
        return float(np.mean([f.rmse for f in self.folds])) if self.folds else float("nan")
        
    @property
    def mean_mase(self) -> float:
        return float(np.mean([f.mase for f in self.folds if not np.isnan(f.mase)])) if self.folds else float("nan")
        
    @property
    def mean_bias(self) -> float:
        return float(np.mean([f.bias for f in self.folds if not np.isnan(f.bias)])) if self.folds else float("nan")
        
    @property
    def mean_trend_acc(self) -> float:
        return float(np.mean([f.trend_acc for f in self.folds if not np.isnan(f.trend_acc)])) if self.folds else float("nan")
        
    @property
    def mean_picp(self) -> float:
        total_valid = sum(f.valid_interval_count for f in self.folds)
        if total_valid == 0:
            return float("nan")
        total_covered = sum(f.covered_count for f in self.folds)
        return float(100.0 * total_covered / total_valid)
        
    @property
    def total_interval_evaluations(self) -> int:
        return sum(f.valid_interval_count for f in self.folds)
        
    @property
    def total_interval_covered(self) -> int:
        return sum(f.covered_count for f in self.folds)
        
    @property
    def picp_target(self) -> float:
        return 95.0

    @property
    def global_wape(self) -> float:
        if not self.folds:
            return float("nan")
        total_actual = sum(f.actual_sum for f in self.folds)
        if total_actual == 0:
            return float("nan")
        return float(100.0 * sum(f.absolute_error_sum for f in self.folds) / total_actual)


def walk_forward_splits(n: int, initial_train_size: int, horizon: int, step: int, max_folds: int | None = None):
    """
    Yields (train_end, test_start, test_end) index tuples. Expanding
    window: train always starts at index 0 and grows; test is always
    the `horizon` observations immediately after train, with no gap
    and no overlap.

    max_folds: if the raw `step` would produce more folds than this,
    the effective step is widened so exactly `max_folds` folds are
    yielded, spread evenly from `initial_train_size` to `n`. This keeps
    the comparison time-aware and still covers the ENTIRE series (every
    season/year stays represented) - it just avoids evaluating a fold
    every `step` days on a long series, which is what made a ~2000-day
    dataset with step=14 produce 140+ folds. If the raw step already
    produces <= max_folds folds, nothing changes - normal splits are
    used as-is.
    """
    max_possible = (n - initial_train_size - horizon) // step + 1

    effective_step = step
    if max_folds is not None and max_possible > max_folds:
        span = n - initial_train_size - horizon
        effective_step = max(step, span // (max_folds - 1)) if max_folds > 1 else span

    train_end = initial_train_size
    n_yielded = 0
    while train_end + horizon <= n and (max_folds is None or n_yielded < max_folds):
        yield train_end, train_end, train_end + horizon
        train_end += effective_step
        n_yielded += 1


def evaluate_model_walk_forward(
    model_factory, series: pd.Series, model_name: str, category: str,
    initial_train_size: int = 120, horizon: int = 7, step: int = 14, max_folds: int | None = 20,
) -> WalkForwardResult:
    """
    model_factory: zero-arg callable returning a FRESH, unfitted model
    each fold, so no fold shares fitted state with another.

    max_folds caps runtime on long series by widening the effective
    step (see walk_forward_splits) rather than dropping folds from one
    end - 20 evenly-spread expanding-window folds is enough to rank
    models reliably; raise it if you have time budget and want a
    finer-grained comparison, lower it if a run is still too slow.

    A fold that raises during fit/predict (e.g. not enough history yet)
    is skipped, not scored with a fabricated number - the resulting
    WalkForwardResult simply has fewer folds, which is visible and
    honest rather than hidden.
    """
    result = WalkForwardResult(model_name=model_name, category=category)
    n = len(series)

    all_step_residuals = [[] for _ in range(horizon)]

    for fold_idx, (train_end, test_start, test_end) in enumerate(
        walk_forward_splits(n, initial_train_size, horizon, step, max_folds=max_folds)
    ):
        train_series = series.iloc[:train_end]
        test_series = series.iloc[test_start:test_end]

        model = model_factory()
        try:
            model.fit(train_series)
            if hasattr(model, "predict_with_interval"):
                preds, y_lower, y_upper = model.predict_with_interval(horizon)
            else:
                preds = model.predict(horizon)
                y_lower = []
                y_upper = []
                for h in range(len(preds)):
                    if len(all_step_residuals[h]) >= 2:
                        lb = float(preds[h] + np.percentile(all_step_residuals[h], 2.5))
                        ub = float(preds[h] + np.percentile(all_step_residuals[h], 97.5))
                        y_lower.append(min(lb, ub))
                        y_upper.append(max(lb, ub))
                    else:
                        y_lower.append(float('nan'))
                        y_upper.append(float('nan'))
                y_lower = np.array(y_lower)
                y_upper = np.array(y_upper)
        except Exception:
            continue

        y_true = test_series.values
        
        picp_val, valid_count, covered_count = picp(y_true, y_lower, y_upper)

        # Collect step residuals AFTER evaluation to prevent leakage
        for h in range(len(preds)):
            all_step_residuals[h].append(float(y_true[h] - preds[h]))

        result.folds.append(FoldResult(
            fold_index=fold_idx,
            train_size=len(train_series),
            test_size=len(test_series),
            mae=mae(y_true, preds),
            smape=smape(y_true, preds),
            wape=wape(y_true, preds),
            rmse=rmse(y_true, preds),
            mase=mase(y_true, preds, train_series.values),
            bias=bias(y_true, preds),
            trend_acc=trend_accuracy(y_true, preds),
            picp=picp_val,
            actual_sum=float(np.sum(np.abs(y_true))),
            absolute_error_sum=float(np.sum(np.abs(y_true - preds))),
            interval_count=len(y_true),
            covered_count=covered_count,
            valid_interval_count=valid_count,
        ))

    if result.folds:
        # Calculate empirical quantiles (2.5% and 97.5%)
        result.step_lower_residuals = []
        result.step_upper_residuals = []
        for residuals in all_step_residuals:
            if residuals:
                result.step_lower_residuals.append(float(np.percentile(residuals, 2.5)))
                result.step_upper_residuals.append(float(np.percentile(residuals, 97.5)))
            else:
                result.step_lower_residuals.append(0.0)
                result.step_upper_residuals.append(0.0)

    return result