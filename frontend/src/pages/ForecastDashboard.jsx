import React, { useState } from 'react';
import ForecastForm from '../components/ForecastForm';
import ForecastSummary from '../components/ForecastSummary';
import ForecastChart from '../components/ForecastChart';
import ForecastTable from '../components/ForecastTable';
import ModelMetrics from '../components/ModelMetrics';
import ExplanationPanel from '../components/ExplanationPanel';
import RiskPanel from '../components/RiskPanel';
import RecommendationPanel from '../components/RecommendationPanel';
import { generateForecast } from '../api/forecastApi';

function ForecastDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastResponse, setForecastResponse] = useState(null);

  const handleGenerateForecast = async (request) => {
    setLoading(true);
    setError(null);
    setForecastResponse(null);

    try {
      const response = await generateForecast(request);
      setForecastResponse(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              <ForecastChart forecast={forecastResponse.forecast} />
              <ForecastTable forecast={forecastResponse.forecast} />
              <ModelMetrics metrics={forecastResponse.metrics} />
              <ExplanationPanel explanation={forecastResponse.explanation} />
              <RiskPanel risk={forecastResponse.risk} />
              <RecommendationPanel recommendation={forecastResponse.recommendation} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForecastDashboard;
