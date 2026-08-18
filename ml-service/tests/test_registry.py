import numpy as np
import pytest

import app.models.registry as registry
from app.models.evaluation import WalkForwardResult, FoldResult


class _DummyModel:
    def predict(self, horizon):
        return np.zeros(horizon)


def test_register_and_load_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setattr(registry, "ARTIFACTS_DIR", tmp_path / "artifacts")
    monkeypatch.setattr(registry, "MANIFEST_PATH", tmp_path / "artifacts" / "manifest.json")

    metrics = WalkForwardResult(model_name="dummy", category="TEST_CAT", folds=[
        FoldResult(fold_index=0, train_size=100, test_size=7, mae=1.0, smape=2.0, wape=3.0, rmse=1.0, mase=1.0, bias=0.0, trend_acc=100.0, picp=100.0, actual_sum=10.0, absolute_error_sum=2.0)
    ])

    entry = registry.register_model("TEST_CAT", "dummy", _DummyModel(), metrics, n_training_rows=100)
    assert entry.category == "TEST_CAT"

    loaded_model, loaded_entry = registry.load_model("TEST_CAT")
    assert loaded_entry["model_type"] == "dummy"
    assert len(loaded_model.predict(3)) == 3


def test_load_model_missing_category_raises(tmp_path, monkeypatch):
    monkeypatch.setattr(registry, "ARTIFACTS_DIR", tmp_path / "artifacts")
    monkeypatch.setattr(registry, "MANIFEST_PATH", tmp_path / "artifacts" / "manifest.json")
    with pytest.raises(FileNotFoundError):
        registry.load_model("NOT_REGISTERED")