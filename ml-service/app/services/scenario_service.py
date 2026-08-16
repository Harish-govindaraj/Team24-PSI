"""
Scenario analysis: supply shocks and demand uncertainty via Monte
Carlo simulation. Built strictly ON TOP of the deterministic
risk/recommendation logic (Parts 3-4) - those stay the primary,
auditable decision path. This layer only adds an uncertainty band
around the deterministic numbers; it does not replace them.

Simplified for hackathon scope: demand uncertainty is modeled as
normally distributed around the point forecast, with a standard
deviation derived from the model's own MEASURED walk-forward sMAPE
(Step 2) - not an invented number, but also not a rigorous
probabilistic forecasting model. SARIMA-backed categories already get
a proper statistical interval in Step 3; this Monte Carlo layer exists
for the categories/models that don't.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass
class ScenarioResult:
    category: str
    n_simulations: int
    supply_shock_pct: float
    stockout_probability: float
    mean_shortfall_units: float
    note: str


def run_supply_shock_monte_carlo(
    category: str,
    forecast_points: list,
    inventory_units: int,
    lead_time_days: int,
    mean_smape_pct: float,
    supply_shock_pct: float = 0.0,
    n_simulations: int = 200,
    seed: int = 42,
) -> ScenarioResult:
    """
    Simulates n_simulations draws of total demand over the forecast
    horizon (normal around the point forecast, std proportional to the
    model's own measured sMAPE), reduces available supply by
    supply_shock_pct (e.g. 0.3 = a 30% supply cut), and reports what
    fraction of simulations would stock out and by how much.
    """
    rng = np.random.default_rng(seed)

    point_forecasts = np.array([p["predictedSales"] for p in forecast_points])
    relative_std = np.clip(mean_smape_pct / 100.0, 0.05, 1.5)

    simulated_totals = []
    for _ in range(n_simulations):
        daily_draws = rng.normal(loc=point_forecasts, scale=point_forecasts * relative_std + 0.01)
        daily_draws = np.clip(daily_draws, a_min=0, a_max=None)
        simulated_totals.append(daily_draws.sum())
    simulated_totals = np.array(simulated_totals)

    effective_supply = inventory_units * (1.0 - supply_shock_pct)
    stockouts = simulated_totals > effective_supply
    shortfall = np.clip(simulated_totals - effective_supply, a_min=0, a_max=None)

    return ScenarioResult(
        category=category,
        n_simulations=n_simulations,
        supply_shock_pct=supply_shock_pct,
        stockout_probability=round(float(stockouts.mean()), 4),
        mean_shortfall_units=round(float(shortfall.mean()), 2),
        note=(
            "Simulated demand uncertainty using the model's own measured sMAPE as a "
            "rough volatility proxy, against SYNTHETIC inventory data. A simplified "
            "scenario estimate for planning discussion, not a validated probabilistic "
            "forecast or a guarantee of any kind."
        ),
    )