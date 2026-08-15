from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}

def test_forecast_7_days():
    response = client.post("/forecast", json={"category": "R03", "horizon": 7})
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "R03"
    assert len(data["forecast"]) == 7

def test_forecast_14_days():
    response = client.post("/forecast", json={"category": "R03", "horizon": 14})
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast"]) == 14

def test_forecast_30_days():
    response = client.post("/forecast", json={"category": "R03", "horizon": 30})
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast"]) == 30

def test_forecast_schema_and_deterministic_output():
    response = client.post("/forecast", json={"category": "UNKNOWN", "horizon": 7})
    assert response.status_code == 200
    data = response.json()
    
    assert data["model"] == "PSI-MVP-Forecast"
    assert data["confidence_score"] == 0.92
    assert data["metrics"]["mae"] == 12.5
    assert len(data["explanation"]) == 2
    assert data["risk"]["level"] == "LOW"
    assert data["recommendation"]["human_approval_required"] is False
    
    # check snake_case response structure
    assert "predicted_sales" in data["forecast"][0]
    assert "lower_bound" in data["forecast"][0]
    assert "upper_bound" in data["forecast"][0]

def test_invalid_horizon():
    response = client.post("/forecast", json={"category": "R03", "horizon": "not_an_int"})
    assert response.status_code == 422 # Pydantic validation error
