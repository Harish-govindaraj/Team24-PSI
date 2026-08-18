import pytest
import pandas as pd
import numpy as np
from app.utils.stats import compute_series_stats

def test_stable_demand_classification():
    # Stable: ADI < 1.32 and CV2 < 0.49
    # ADI ~ 1.0 (almost every period has demand), low variance
    np.random.seed(42)
    demand = np.random.normal(100, 10, 365) # Mean 100, Std 10
    series = pd.Series(demand, index=pd.date_range("2024-01-01", periods=365))
    
    stats = compute_series_stats(series, "TEST_STABLE")
    assert stats.demand_classification == "Stable"
    assert stats.adi < 1.32
    assert stats.cv2 < 0.49

def test_intermittent_demand_classification():
    # Intermittent: ADI >= 1.32 and CV2 < 0.49
    np.random.seed(42)
    # We need overall CV2 < 0.49, meaning std/mean < 0.7.
    # We also need ADI >= 1.32 (at least ~30% zeroes).
    # If 30% are zero, and 70% are constant C, the mean is 0.7*C.
    # The variance is 0.3*(0-0.7*C)^2 + 0.7*(C-0.7*C)^2 = C^2(0.3*0.49 + 0.7*0.09) = C^2(0.147 + 0.063) = 0.21*C^2.
    # Std is sqrt(0.21)*C ~ 0.458*C.
    # CV = 0.458*C / 0.7*C = 0.65.
    # CV2 = 0.65^2 = 0.422. This is < 0.49!
    demand = np.zeros(365)
    # 70% non-zero
    idx = np.random.choice(365, int(365*0.7), replace=False)
    demand[idx] = 100 
    
    series = pd.Series(demand, index=pd.date_range("2024-01-01", periods=365))
    stats = compute_series_stats(series, "TEST_INTERMITTENT")
    
    assert stats.adi >= 1.32
    assert stats.cv2 < 0.49
    assert stats.demand_classification == "Intermittent"

def test_volatile_demand_classification():
    # Volatile: CV2 >= 0.49
    # Huge variance
    np.random.seed(42)
    demand = np.random.lognormal(mean=2, sigma=2, size=365) 
    series = pd.Series(demand, index=pd.date_range("2024-01-01", periods=365))
    
    stats = compute_series_stats(series, "TEST_VOLATILE")
    assert stats.cv2 >= 0.49
    assert stats.demand_classification == "Volatile"
