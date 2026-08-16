"""
Full-workflow integration test: forecast -> decision intelligence ->
scenario, in sequence, for the same category and horizon - checking
that the pieces are internally consistent with each other, not just
individually correct.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.registry import get_manifest

client = TestClient(app)


def _first_registered_category() -> str:
    manifest = get_manifest()
    if not manifest:
        pytest.skip("No models registered - run scripts/train.py first.")
    return sorted(manifest.keys())[0]


def test_full_workflow_is_internally_consistent():
    category = _first_registered_category()
    horizon = 7

    health = client.get("/health")
    assert health.status_code == 200
    assert category in health.json()["categories"]

    forecast_resp = client.post("/forecast", json={"category": category, "horizon": horizon})
    assert forecast_resp.status_code == 200
    forecast_body = forecast_resp.json()

    decision_resp = client.get(f"/decision-intelligence/{category}?horizon={horizon}")
    assert decision_resp.status_code == 200
    decision_body = decision_resp.json()

    # The model backing this category shouldn't silently differ between
    # a plain forecast and a decision-intelligence call for the same
    # category+horizon - both go through forecast_service.generate_forecast().
    assert decision_body["forecastSummary"]["modelType"] == forecast_body["modelType"]
    assert decision_body["forecastSummary"]["trend"] == forecast_body["trend"]

    scenario_resp = client.post("/scenario", json={
        "category": category, "horizon": horizon, "supplyShockPct": 0.3, "nSimulations": 100,
    })
    assert scenario_resp.status_code == 200
    scenario_body = scenario_resp.json()
    assert 0.0 <= scenario_body["stockoutProbability"] <= 1.0

    # A harsher supply shock should never produce a LOWER stockout
    # probability than a milder one, for the same category/horizon.
    milder_resp = client.post("/scenario", json={
        "category": category, "horizon": horizon, "supplyShockPct": 0.05, "nSimulations": 100,
    })
    assert milder_resp.json()["stockoutProbability"] <= scenario_body["stockoutProbability"] + 1e-9


def test_unregistered_category_fails_consistently_across_all_endpoints():
    fake = "TOTALLY_NOT_A_CATEGORY"
    assert client.post("/forecast", json={"category": fake, "horizon": 7}).status_code in (404, 422)
    assert client.get(f"/decision-intelligence/{fake}?horizon=7").status_code == 404
    assert client.get(f"/operational-data/{fake}").status_code == 404
    assert client.post("/scenario", json={"category": fake, "horizon": 7}).status_code in (404, 422)