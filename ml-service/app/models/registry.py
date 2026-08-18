"""
Model registry: tracks which trained artifact is "the current model"
for each category, with a version and the metrics that justified
picking it. scripts/train.py writes to this. FastAPI (Step 3) only
ever READS from this - training never happens inside an API request.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path

import joblib

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = PROJECT_ROOT / "models" / "artifacts"
MANIFEST_PATH = ARTIFACTS_DIR / "manifest.json"


@dataclass
class ModelEntry:
    category: str
    model_type: str
    version: str
    artifact_filename: str
    trained_at: str
    mean_mae: float
    mean_smape: float
    global_wape: float
    mean_rmse: float
    mean_mase: float
    mean_bias: float
    mean_trend_acc: float
    mean_picp: float
    n_training_rows: int
    step_lower_residuals: list[float] | None = None
    step_upper_residuals: list[float] | None = None


def _load_manifest() -> dict:
    if not MANIFEST_PATH.exists():
        return {}
    with open(MANIFEST_PATH, "r") as f:
        return json.load(f)


def _save_manifest(manifest: dict) -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)


def register_model(category: str, model_type: str, model_object, metrics, n_training_rows: int) -> ModelEntry:
    """Saves the fitted model to disk and records it as the CURRENT
    model for this category. Versioned by UTC timestamp so retraining
    never silently overwrites a previous artifact file (the manifest
    entry does get replaced - it always points at the latest - but old
    .joblib files stay on disk until you clean them up manually)."""
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    version = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    artifact_filename = f"{category}__{model_type}__{version}.joblib"

    joblib.dump(model_object, ARTIFACTS_DIR / artifact_filename)

    import math
    entry = ModelEntry(
        category=category, model_type=model_type, version=version,
        artifact_filename=artifact_filename,
        trained_at=datetime.now(timezone.utc).isoformat(),
        mean_mae=round(metrics.mean_mae, 4) if not math.isnan(metrics.mean_mae) else float('nan'),
        mean_smape=round(metrics.mean_smape, 4) if not math.isnan(metrics.mean_smape) else float('nan'),
        global_wape=round(metrics.global_wape, 4) if not math.isnan(metrics.global_wape) else float('nan'),
        mean_rmse=round(metrics.mean_rmse, 4) if not math.isnan(metrics.mean_rmse) else float('nan'),
        mean_mase=round(metrics.mean_mase, 4) if not math.isnan(metrics.mean_mase) else float('nan'),
        mean_bias=round(metrics.mean_bias, 4) if not math.isnan(metrics.mean_bias) else float('nan'),
        mean_trend_acc=round(metrics.mean_trend_acc, 4) if not math.isnan(metrics.mean_trend_acc) else float('nan'),
        mean_picp=round(metrics.mean_picp, 4) if not math.isnan(metrics.mean_picp) else float('nan'),
        n_training_rows=n_training_rows,
        step_lower_residuals=metrics.step_lower_residuals,
        step_upper_residuals=metrics.step_upper_residuals,
    )

    manifest = _load_manifest()
    manifest[category] = asdict(entry)
    _save_manifest(manifest)

    logger.info("Registered %s for %s (WAPE=%.2f%%) -> %s", model_type, category, entry.global_wape, artifact_filename)
    return entry


def load_model(category: str):
    """Loads the currently registered artifact for a category. Raises
    FileNotFoundError with an actionable message if nothing is
    registered yet - Step 3's FastAPI layer will catch this and turn
    it into a proper structured API error instead of a 500 crash."""
    manifest = _load_manifest()
    if category not in manifest:
        raise FileNotFoundError(
            f"No trained model registered for category '{category}'. "
            f"Run scripts/train.py first. Registered categories: {list(manifest.keys())}"
        )
    entry = manifest[category]
    artifact_path = ARTIFACTS_DIR / entry["artifact_filename"]
    if not artifact_path.exists():
        raise FileNotFoundError(
            f"Manifest references {artifact_path} but that file is missing on disk. "
            f"Re-run scripts/train.py to regenerate it."
        )
    return joblib.load(artifact_path), entry


def get_manifest() -> dict:
    return _load_manifest()