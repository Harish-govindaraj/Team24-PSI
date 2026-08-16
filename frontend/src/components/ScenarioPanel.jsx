import React, { useState } from 'react';
import './ScenarioPanel.css'; // Optional: add some styles if needed

function ScenarioPanel({ category, horizon, onRunScenario, result, loading, error }) {
  const [supplyShockPct, setSupplyShockPct] = useState(0.3); // default 30%
  const [nSimulations, setNSimulations] = useState(200); // default 200

  const handleRun = () => {
    if (onRunScenario) {
      onRunScenario({
        category,
        horizon,
        supplyShockPct,
        nSimulations
      });
    }
  };

  const formatProbability = (prob) => {
    if (prob == null) return 'N/A';
    return `${(prob * 100).toFixed(1)}%`;
  };

  const getProbabilityStyle = (prob) => {
    if (prob == null) return {};
    if (prob >= 0.5) return { color: '#d32f2f', fontWeight: 'bold' }; // Red for high probability
    if (prob >= 0.2) return { color: '#f57c00', fontWeight: 'bold' }; // Orange for medium
    return { color: '#388e3c', fontWeight: 'bold' }; // Green for low
  };

  return (
    <div className="scenario-panel panel">
      <h3>What-If Scenario: Supply Shock</h3>
      <p className="scenario-intro">
        Simulate the impact of a sudden reduction in available inventory for category <strong>{category}</strong> over the next <strong>{horizon}</strong> days.
      </p>

      <div className="scenario-controls">
        <div className="control-group">
          <label htmlFor="supplyShockPct">
            Supply Shock (Inventory Lost): <strong>{(supplyShockPct * 100).toFixed(0)}%</strong>
          </label>
          <input
            type="range"
            id="supplyShockPct"
            min="0"
            max="0.95"
            step="0.05"
            value={supplyShockPct}
            onChange={(e) => setSupplyShockPct(parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label htmlFor="nSimulations">Number of Simulations:</label>
          <input
            type="number"
            id="nSimulations"
            min="50"
            max="2000"
            value={nSimulations}
            onChange={(e) => setNSimulations(parseInt(e.target.value, 10))}
          />
        </div>

        <button          className="btn-primary"          onClick={handleRun}          disabled={loading}
        >
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>

      {error && <div className="error-message scenario-error">{error}</div>}

      {result && !loading && (
        <div className="scenario-result-container">
          <h4>Simulation Results</h4>
          <div className="scenario-metrics">
            <div className="metric-box">
              <span className="metric-label">Supply Shock</span>
              <span className="metric-value">{(result.supplyShockPct * 100).toFixed(0)}%</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Simulations</span>
              <span className="metric-value">{result.nSimulations}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Stockout Probability</span>
              <span className="metric-value" style={getProbabilityStyle(result.stockoutProbability)}>
                {formatProbability(result.stockoutProbability)}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Mean Shortfall</span>
              <span className="metric-value">{result.meanShortfallUnits} units</span>
            </div>
          </div>
          {result.note && (
            <div className="scenario-disclaimer">
              <strong>⚠ Disclaimer:</strong> {result.note}
              <br/>
              <em>Note: Operational data underlying this simulation is synthetic.</em>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScenarioPanel;
