"""
Trains and selects the best model per category using walk-forward
validation only, then registers the winner for each category.

Run manually whenever you want to (re)train:

    python3 scripts/train.py

Produces:
  - models/artifacts/<category>__<model>__<version>.joblib   (one per category)
  - models/artifacts/manifest.json                             (the registry)
  - A printed comparison table - every number comes directly from
    evaluate_model_walk_forward(); nothing here is invented.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))  # lets `app.*` imports work when run as a script

import pandas as pd

from app.utils.data_loader import load_raw_sales_data, get_category_series, CATEGORY_COLUMNS
from app.utils.stats import compute_series_stats
from app.models.baseline import (
    NaiveForecaster, SeasonalNaiveForecaster, ExponentialSmoothingForecaster, SARIMAForecaster,
)
from app.models.ml_models import XGBoostForecaster, LightGBMForecaster
from app.models.evaluation import evaluate_model_walk_forward
from app.models.registry import register_model

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

CANDIDATE_MODELS = {
    "naive": lambda: NaiveForecaster(),
    "seasonal_naive": lambda: SeasonalNaiveForecaster(season_length=7),
    "exponential_smoothing": lambda: ExponentialSmoothingForecaster(seasonal_periods=7),
    "sarima": lambda: SARIMAForecaster(),
    "xgboost": lambda: XGBoostForecaster(),
    "lightgbm": lambda: LightGBMForecaster(),
}


def select_best_model(category: str, series: pd.Series):
    """
    Runs walk-forward validation for EVERY candidate on this category,
    ranks by mean WAPE (lower is better - it's the most stakeholder-
    interpretable metric: "off by X% of total volume"). Intermittent
    (N05C-style, high zero-demand) and volatile (R03-style, high CV)
    categories are NOT special-cased with a different candidate pool -
    they get evaluated fairly against all six models, and in practice
    naive/seasonal_naive often win on highly intermittent series
    precisely because complex models overfit noise. We measure this
    rather than assume it.
    """
    results = {}
    for model_name, factory in CANDIDATE_MODELS.items():
        wf_result = evaluate_model_walk_forward(
            factory, series, model_name=model_name, category=category,
            initial_train_size=120, horizon=7, step=14, max_folds=20,
        )
        if not wf_result.folds:
            logger.warning("  %-22s produced NO valid folds - skipping", model_name)
            continue
        results[model_name] = wf_result
        logger.info(
            "  %-22s WAPE=%6.2f%%  sMAPE=%6.2f%%  MAE=%7.2f  (%d folds)",
            model_name, wf_result.mean_wape, wf_result.mean_smape, wf_result.mean_mae, len(wf_result.folds),
        )

    if not results:
        raise RuntimeError(f"No model produced valid results for '{category}' - check the series length.")

    best_name = min(results, key=lambda name: results[name].mean_wape)
    return best_name, results[best_name]


def main():
    df = load_raw_sales_data()
    existing_categories = [c for c in CATEGORY_COLUMNS if c in df.columns]
    logger.info("Training models for %d categories: %s", len(existing_categories), existing_categories)

    summary_rows = []
    for category in existing_categories:
        logger.info("=" * 70)
        logger.info("CATEGORY: %s", category)
        series = get_category_series(df, category)
        stats = compute_series_stats(series, category)

        flags = []
        if stats.zero_demand_pct > 50:
            flags.append("INTERMITTENT")
        if stats.volatility_cv > 1:
            flags.append("VOLATILE")
        logger.info(
            "  stats: mean=%.2f zero%%=%.1f cv=%.2f trend=%.4f %s",
            stats.mean, stats.zero_demand_pct, stats.volatility_cv, stats.trend_slope,
            ("[" + ",".join(flags) + "]") if flags else "",
        )

        best_name, best_result = select_best_model(category, series)
        logger.info("  -> SELECTED: %s (WAPE=%.2f%%)", best_name, best_result.mean_wape)

        # Refit the WINNING model type on the full series - this final
        # fit is what actually gets served, not any single fold's model.
        final_model = CANDIDATE_MODELS[best_name]()
        final_model.fit(series)
        entry = register_model(category, best_name, final_model, best_result, n_training_rows=len(series))

        summary_rows.append({
            "category": category,
            "model": best_name,
            "wape_pct": entry.mean_wape,
            "smape_pct": entry.mean_smape,
            "mae": entry.mean_mae,
            "flags": ",".join(flags) if flags else "-",
        })

    logger.info("=" * 70)
    logger.info("TRAINING SUMMARY")
    print(pd.DataFrame(summary_rows).to_string(index=False))


if __name__ == "__main__":
    main()