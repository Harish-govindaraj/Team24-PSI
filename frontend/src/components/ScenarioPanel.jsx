import React, { useState } from 'react';

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
    <div className="card">
      <h3 className="card-title text-primary mb-2">What-If Scenario: Supply Shock</h3>
      <p className="text-secondary mb-6">
        Simulate the impact of a sudden reduction in available inventory for category <strong>{category}</strong> over the next <strong>{horizon}</strong> days.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'flex-end', background: 'var(--psi-background)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', border: '1px solid var(--psi-border)' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
          <label htmlFor="supplyShockPct" className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Supply Shock (Inventory Lost)</span>
            <strong>{(supplyShockPct * 100).toFixed(0)}%</strong>
          </label>
          <input
            type="range"
            id="supplyShockPct"
            min="0"
            max="0.95"
            step="0.05"
            value={supplyShockPct}
            onChange={(e) => setSupplyShockPct(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
          <label htmlFor="nSimulations" className="form-label">Number of Simulations</label>
          <input
            type="number"
            id="nSimulations"
            className="form-control"
            min="50"
            max="2000"
            value={nSimulations}
            onChange={(e) => setNSimulations(parseInt(e.target.value, 10))}
          />
        </div>

        <button className="btn btn-primary" onClick={handleRun} disabled={loading} style={{ height: 'fit-content' }}>
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && !loading && (
        <div style={{ background: 'var(--psi-info-bg)', border: '1px solid #93C5FD', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
          <h4 className="text-primary" style={{ margin: '0 0 var(--space-4) 0' }}>Simulation Results</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Supply Shock</span>
              <div className="text-primary" style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 'var(--space-1)' }}>{(result.supplyShockPct * 100).toFixed(0)}%</div>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Simulations</span>
              <div className="text-primary" style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 'var(--space-1)' }}>{result.nSimulations}</div>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Stockout Probability</span>
              <div style={{ ...getProbabilityStyle(result.stockoutProbability), fontSize: '1.25rem', fontWeight: 600, marginTop: 'var(--space-1)' }}>
                {formatProbability(result.stockoutProbability)}
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Mean Shortfall</span>
              <div className="text-primary" style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 'var(--space-1)' }}>{result.meanShortfallUnits} units</div>
            </div>
          </div>
          {result.note && (
            <div className="alert alert-warning" style={{ margin: 0 }}>
              <strong>⚠ Disclaimer:</strong> {result.note}
              <br/>
              <em style={{ fontSize: '0.875rem' }}>Note: Operational data underlying this simulation is synthetic.</em>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScenarioPanel;
