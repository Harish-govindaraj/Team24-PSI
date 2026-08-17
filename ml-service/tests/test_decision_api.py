import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.registry import get_manifest

client = TestClient(app)


def _first_registered_category() -> str:
    manifest = get_manifest()
    if not manifest:
        pytest.skip("No models registered - run scripts/train.py (Step 2) first.")
    return sorted(manifest.keys())[0]


def test_operational_data_endpoint_returns_disclaimer():
    category = _first_registered_category()
    resp = client.get(f"/operational-data/{category}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["is_synthetic"] is True
    assert "synthetic" in body["disclaimer"].lower()


def test_decision_intelligence_returns_recommendations_with_approval_flag():
    category = _first_registered_category()
    resp = client.get(f"/decision-intelligence/{category}?horizon=7")
    assert resp.status_code == 200
    body = resp.json()
    assert body["category"] == category
    assert len(body["recommendations"]) > 0
    assert all(r["humanApprovalRequired"] is True for r in body["recommendations"])
    assert "synthetic" in body["dataDisclaimer"].lower()


def test_scenario_endpoint_returns_probability():
    category = _first_registered_category()
    resp = client.post("/scenario", json={"category": category, "horizon": 7, "supplyShockPct": 0.3, "nSimulations": 100})
    assert resp.status_code == 200
    assert 0.0 <= resp.json()["stockoutProbability"] <= 1.0


def test_decision_intelligence_unknown_category_404():
    resp = client.get("/decision-intelligence/NOT_REAL?horizon=7")
    assert resp.status_code == 404