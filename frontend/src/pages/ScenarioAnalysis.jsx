import React, { useState } from 'react';
import ForecastForm from '../components/ForecastForm';
import ScenarioPanel from '../components/ScenarioPanel';
import { runScenario } from '../api/forecastApi';

const ScenarioAnalysis = () => {
  const [config, setConfig] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState(null);

  const handleConfigure = ({ category, horizon }) => {
    setConfig({ category, horizon });
    // Reset previous run
    setScenarioResult(null);
    setScenarioError(null);
  };

  const handleRunScenario = async (scenarioRequest) => {
    setScenarioLoading(true);
    setScenarioError(null);
    setScenarioResult(null);

    try {
      const result = await runScenario(scenarioRequest);
      setScenarioResult(result);
    } catch (err) {
      setScenarioError(err.message);
    } finally {
      setScenarioLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginInline: 'auto' }}>
      <div style={{ marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.5rem' }}>📉</span>
          <h1 className="text-primary" style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.025em' }}>Scenario Analysis Workspace</h1>
        </div>
        <p className="text-secondary" style={{ margin: 0, fontSize: '1.1rem' }}>Evaluate the impact of supply shocks and simulate operational risks.</p>
      </div>

      <div className="forecast-layout">
        {/* Left Column: Sticky Configuration Panel */}
        <div style={{ position: 'sticky', top: 'var(--space-6)' }}>
          <ForecastForm
            onSubmit={handleConfigure}
            isLoading={scenarioLoading}
            submitLabel="Configure Scenario"
            loadingLabel="Configuring..."
          />
        </div>

        {/* Right Column: Main Content */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {!config && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', backgroundColor: 'var(--psi-surface)', border: '1px dashed var(--psi-border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>⚙️</div>
              <h3 className="text-primary" style={{ margin: '0 0 var(--space-2) 0' }}>No Scenario Configured</h3>
              <p className="text-secondary" style={{ margin: 0 }}>Select a product category and time horizon to begin simulation.</p>
            </div>
          )}

          {config && (
            <>
              <ScenarioPanel
                category={config.category}
                horizon={config.horizon}
                onRunScenario={handleRunScenario}
                result={scenarioResult}
                loading={scenarioLoading}
                error={scenarioError}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                <div className="card" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  <h3 className="card-title text-primary mb-2">What-If Scenario: Demand Surge</h3>
                  <p className="text-secondary mb-4">Simulate sudden market demand spikes and promotional impacts.</p>
                  <span className="badge badge-warning">Enterprise Module Coming Soon</span>
                </div>
                <div className="card" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  <h3 className="card-title text-primary mb-2">Inventory Simulation</h3>
                  <p className="text-secondary mb-4">Run full-scale multi-echelon inventory network optimization.</p>
                  <span className="badge badge-warning">Enterprise Module Coming Soon</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalysis;
