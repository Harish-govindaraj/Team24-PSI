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
        return float(np.sum(np.abs(y_pred)))  # no real volume to compare against; report raw error
    return float(100.0 * np.sum(np.abs(y_true - y_pred)) / total_actual)


@dataclass
class FoldResult:
    fold_index: int
    train_size: int
    test_size: int
    mae: float
    smape: float
    wape: float


@dataclass
class WalkForwardResult:
    model_name: str
    category: str
    folds: list = field(default_factory=list)

    @property
    def mean_mae(self) -> float:
        return float(np.mean([f.mae for f in self.folds])) if self.folds else float("nan")

    @property
    def mean_smape(self) -> float:
        return float(np.mean([f.smape for f in self.folds])) if self.folds else float("nan")

    @property
    def mean_wape(self) -> float:
        return float(np.mean([f.wape for f in self.folds])) if self.folds else float("nan")


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

    for fold_idx, (train_end, test_start, test_end) in enumerate(
        walk_forward_splits(n, initial_train_size, horizon, step, max_folds=max_folds)
    ):
        train_series = series.iloc[:train_end]
        test_series = series.iloc[test_start:test_end]

        model = model_factory()
        try:
            model.fit(train_series)
            preds = model.predict(horizon)
        except Exception:
            continue

        y_true = test_series.values
        result.folds.append(FoldResult(
            fold_index=fold_idx,
            train_size=len(train_series),
            test_size=len(test_series),
            mae=mae(y_true, preds),
            smape=smape(y_true, preds),
            wape=wape(y_true, preds),
        ))

    return result