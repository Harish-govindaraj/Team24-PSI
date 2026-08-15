from fastapi import FastAPI
from app.schemas import ForecastRequest, ForecastResponse
from app.services.forecast_service import generate_deterministic_forecast

app = FastAPI(title="PSI ML Service MVP")

@app.get("/health")
def health_check():
    return {"status": "UP"}

@app.post("/forecast", response_model=ForecastResponse)
def get_forecast(request: ForecastRequest):
    return generate_deterministic_forecast(request)
