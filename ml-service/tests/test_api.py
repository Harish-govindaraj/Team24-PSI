import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.registry import get_manifest

client = TestClient(app)


def test_health_returns_registered_models():
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["modelsRegistered"] >= 0
    assert isinstance(body["categories"], list)


def _first_registered_category() -> str:
    manifest = get_manifest()
    if not manifest:
        pytest.skip("No models registered - run scripts/train.py (Step 2) before running API tests.")
    return sorted(manifest.keys())[0]


def test_forecast_valid_request_returns_full_contract():
    category = _first_registered_category()
    resp = client.post("/forecast", json={"category": category, "horizon": 7})
    assert resp.status_code == 200
    body = resp.json()

    assert body["category"] == category
    assert body["horizon"] == 7
    assert len(body["forecast"]) == 7
    for point in body["forecast"]:
        assert point["predictedSales"] >= 0
        if point["lowerBound"] is not None:
            assert point["lowerBound"] <= point["predictedSales"] <= point["upperBound"]
    assert body["trend"] in {"increasing", "decreasing", "stable"}
    assert "type" in body["seasonality"]
    assert isinstance(body["seasonality"]["detected"], bool)
    assert "meanWapePct" in body["confidence"]
    assert "available" in body["explanation"]


def test_forecast_unknown_category_returns_404():
    resp = client.post("/forecast", json={"category": "NOT_A_REAL_CATEGORY", "horizon": 7})
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_forecast_horizon_zero_returns_422():
    category = _first_registered_category()
    resp = client.post("/forecast", json={"category": category, "horizon": 0})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


def test_forecast_horizon_over_365_returns_422():
    category = _first_registered_category()
    resp = client.post("/forecast", json={"category": category, "horizon": 400})
    assert resp.status_code == 422


def test_forecast_empty_category_returns_422():
    resp = client.post("/forecast", json={"category": "", "horizon": 7})
    assert resp.status_code == 422


def test_forecast_explanation_matches_model_type():
    category = _first_registered_category()
    resp = client.post("/forecast", json={"category": category, "horizon": 5})
    body = resp.json()
    explanation = body["explanation"]
    assert explanation["available"] is True
    if body["modelType"] in {"xgboost", "lightgbm"}:
        assert explanation["method"] == "shap_tree_explainer"
        assert len(explanation["topFeatures"]) > 0
    else:
        assert explanation["method"] == "heuristic"

def test_picp_contract_sample_count():
    category = _first_registered_category()
    resp = client.post("/forecast", json={"category": category, "horizon": 7})
    conf = resp.json()["confidence"]
    if conf["picpAvailable"]:
        assert conf["meanPicp"] is not None
        assert conf["picpSampleCount"] > 0
    else:
        assert conf["meanPicp"] is None
        assert conf["picpSampleCount"] == 0