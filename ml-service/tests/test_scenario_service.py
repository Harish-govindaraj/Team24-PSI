from app.services.scenario_service import run_supply_shock_monte_carlo


def _forecast_points(value=10.0, n=7):
    return [{"day": i + 1, "predictedSales": value} for i in range(n)]


def test_higher_supply_shock_increases_stockout_probability():
    low_shock = run_supply_shock_monte_carlo(
        category="R03", forecast_points=_forecast_points(), inventory_units=1000,
        lead_time_days=10, mean_smape_pct=20.0, supply_shock_pct=0.0, n_simulations=300,
    )
    high_shock = run_supply_shock_monte_carlo(
        category="R03", forecast_points=_forecast_points(), inventory_units=1000,
        lead_time_days=10, mean_smape_pct=20.0, supply_shock_pct=0.8, n_simulations=300,
    )
    assert high_shock.stockout_probability >= low_shock.stockout_probability


def test_stockout_probability_is_a_valid_fraction():
    result = run_supply_shock_monte_carlo(
        category="R03", forecast_points=_forecast_points(), inventory_units=50,
        lead_time_days=10, mean_smape_pct=30.0, supply_shock_pct=0.0, n_simulations=300,
    )
    assert 0.0 <= result.stockout_probability <= 1.0