import React, { useState } from 'react';
import ForecastForm from '../components/ForecastForm';
import ForecastSummary from '../components/ForecastSummary';
import ForecastChart from '../components/ForecastChart';
import ForecastTable from '../components/ForecastTable';
import ModelMetrics from '../components/ModelMetrics';
import ExplanationPanel from '../components/ExplanationPanel';
import RiskPanel from '../components/RiskPanel';
import RecommendationPanel from '../components/RecommendationPanel';
import OperationalDataPanel from '../components/OperationalDataPanel';
import ScenarioPanel from '../components/ScenarioPanel';
import { generateForecast, getHistoricalSales, getOperationalData, runScenario } from '../api/forecastApi';

function ForecastDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastResponse, setForecastResponse] = useState(null);
  const [historicalSales, setHistoricalSales] = useState([]);
  const [operationalData, setOperationalData] = useState(null);

  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState(null);

  const handleGenerateForecast = async (request) => {
    setLoading(true);
    setError(null);
    setForecastResponse(null);
    setHistoricalSales([]);
    setOperationalData(null);
    setScenarioResult(null);
    setScenarioError(null);

    try {
      const [forecastData, historyData, opData] = await Promise.all([
        generateForecast(request),
        getHistoricalSales(request.category).catch(err => {
          console.error("Failed to fetch historical sales:", err);
          return [];
        }),
        getOperationalData(request.category).catch(err => {
          console.error("Failed to fetch operational data:", err);
          return null;
        })
      ]);

      setForecastResponse(forecastData);
      setHistoricalSales(historyData);
      setOperationalData(opData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    <div className="dashboard-container">
      <h2 className="dashboard-title">PSI Forecast Dashboard</h2>

      <div className="dashboard-layout">
        <div className="dashboard-sidebar">
          <ForecastForm
            onSubmit={handleGenerateForecast}
            isLoading={loading}
          />
        </div>

        <div className="dashboard-main">
          {!loading && !error && !forecastResponse && (
            <div className="placeholder-card">
              <p>Select a product category and forecast horizon to generate a forecast.</p>
            </div>
          )}

          {error && (
            <div className="error-card">
              <p>{error}</p>
            </div>
          )}

          {forecastResponse && (
            <div className="results-container">
              <ForecastSummary data={forecastResponse} />
              <ForecastChart forecast={forecastResponse.forecast} historicalSales={historicalSales} />
              <ForecastTable forecast={forecastResponse.forecast} />
              <ModelMetrics metrics={forecastResponse.metrics} />
              <ExplanationPanel explanation={forecastResponse.explanation} />

              <div className="insights-row">
                <OperationalDataPanel operationalData={operationalData} />
                <RiskPanel risk={forecastResponse.risk} />
                <RecommendationPanel recommendations={forecastResponse.recommendations} />
              </div>

              <ScenarioPanel
                category={forecastResponse.category}
                horizon={forecastResponse.horizon}
                onRunScenario={handleRunScenario}
                result={scenarioResult}
                loading={scenarioLoading}
                error={scenarioError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForecastDashboard;
