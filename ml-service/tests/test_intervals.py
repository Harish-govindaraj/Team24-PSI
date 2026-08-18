from app.services.forecast_service import generate_forecast
from app.models.registry import register_model, _load_manifest
from app.models.baseline import NaiveForecaster
from app.models.evaluation import WalkForwardResult
import math
import pandas as pd

def test_forecast_service_empirical_intervals(monkeypatch):
    category = "R03"
    horizon = 3
    
    # Mock registry
    def mock_load_model(cat):
        model = NaiveForecaster()
        model.fit(pd.Series([1.0, 2.0, 3.0]))
        entry = {
            "model_type": "naive",
            "version": "test",
            "mean_mae": 1.0,
            "mean_smape": 10.0,
            "global_wape": 20.0,
            "step_lower_residuals": [-0.5, -1.0, -1.5, -2.0],
            "step_upper_residuals": [0.5, 1.0, 1.5, 2.0]
        }
        return model, entry

    monkeypatch.setattr("app.services.forecast_service.load_model", mock_load_model)
    
    # Mock data loader and stats to avoid disk I/O during test
    monkeypatch.setattr("app.services.forecast_service.load_raw_sales_data", lambda: None)
    monkeypatch.setattr("app.services.forecast_service.get_category_series", lambda *a: type('obj', (object,), {'index': type('idx', (object,), {'__getitem__': lambda s, i: __import__('pandas').Timestamp('2023-01-01')})()})())
    monkeypatch.setattr("app.services.forecast_service.compute_series_stats", lambda *a: type('stats', (object,), {'trend_slope': 0, 'seasonal_strength': 0, 'cv2': 0.1, 'classification_confidence': 100.0, 'demand_classification': 'Stable'})())
    
    res = generate_forecast(category, horizon)
    
    assert res["horizon"] == 3
    for i, pt in enumerate(res["forecast"]):
        # Naive predicts 3.0 (last value)
        assert pt["predictedSales"] == 3.0
        
        # Check intervals are applied correctly
        assert pt["lowerBound"] == 3.0 + [-0.5, -1.0, -1.5][i]
        assert pt["upperBound"] == 3.0 + [0.5, 1.0, 1.5][i]
        
        assert pt["lowerBound"] <= pt["predictedSales"] <= pt["upperBound"]
        assert pt["lowerBound"] >= 0

def test_forecast_service_interval_missing(monkeypatch):
    category = "R03"
    horizon = 3
    
    def mock_load_model(cat):
        model = NaiveForecaster()
        model.fit(pd.Series([1.0, 2.0, 3.0]))
        entry = {
            "model_type": "naive",
            "version": "test",
            "mean_mae": 1.0,
            "mean_smape": 10.0,
            "global_wape": 20.0,
        }
        return model, entry

    monkeypatch.setattr("app.services.forecast_service.load_model", mock_load_model)
    monkeypatch.setattr("app.services.forecast_service.load_raw_sales_data", lambda: None)
    monkeypatch.setattr("app.services.forecast_service.get_category_series", lambda *a: type('obj', (object,), {'index': type('idx', (object,), {'__getitem__': lambda s, i: __import__('pandas').Timestamp('2023-01-01')})()})())
    monkeypatch.setattr("app.services.forecast_service.compute_series_stats", lambda *a: type('stats', (object,), {'trend_slope': 0, 'seasonal_strength': 0, 'cv2': 0.1, 'classification_confidence': 100.0, 'demand_classification': 'Stable'})())
    
    res = generate_forecast(category, horizon)
    
    for pt in res["forecast"]:
        assert pt["lowerBound"] is None
        assert pt["upperBound"] is None
