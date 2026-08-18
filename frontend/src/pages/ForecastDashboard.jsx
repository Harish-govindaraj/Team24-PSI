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
import QualityReportCard from '../components/QualityReportCard';
import { generateForecast, getHistoricalSales, getOperationalData, getQualityReport } from '../api/forecastApi';
import { useAuth } from '../context/AuthContext';

function ForecastDashboard() {
  const { role } = useAuth();
  const isCustomer = role === 'ROLE_CUSTOMER';
  const isShopOwner = role === 'ROLE_PHARMA_SHOP_OWNER';
  const isCompanyOwner = role === 'ROLE_PHARMA_COMPANY_OWNER';
  const isAdmin = role === 'ROLE_ADMIN';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastResponse, setForecastResponse] = useState(null);
  const [historicalSales, setHistoricalSales] = useState([]);
  const [operationalData, setOperationalData] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);

  const handleGenerateForecast = async (request) => {
    setLoading(true);
    setError(null);
    setForecastResponse(null);
    setHistoricalSales([]);
    setOperationalData(null);
    setQualityReport(null);

    try {
      const [forecastData, historyData, opData, qrData] = await Promise.all([
        generateForecast(request),
        getHistoricalSales(request.category).catch(err => {
          console.error("Failed to fetch historical sales:", err);
          return [];
        }),
        getOperationalData(request.category).catch(err => {
          console.error("Failed to fetch operational data:", err);
          return null;
        }),
        getQualityReport(request.category).catch(err => {
          console.error("Failed to fetch quality report:", err);
          return null;
        })
      ]);

      setForecastResponse(forecastData);
      setHistoricalSales(historyData);
      setOperationalData(opData);
      setQualityReport(qrData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', marginInline: 'auto' }}>
      <div style={{ marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h1 className="text-primary" style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.025em' }}>Forecast Intelligence Workspace</h1>
        </div>
        <p className="text-secondary" style={{ margin: 0, fontSize: '1.1rem' }}>AI-powered demand forecasting, scenario analysis, and operational intelligence.</p>
      </div>

      <div className="forecast-layout">
        {/* Left Column: Sticky Configuration Panel */}
        <div style={{ position: 'sticky', top: 'var(--space-6)' }}>
          <ForecastForm
            onSubmit={handleGenerateForecast}
            isLoading={loading}
          />
        </div>

        {/* Right Column: Main Content */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {!loading && !error && !forecastResponse && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', backgroundColor: 'var(--psi-surface)', border: '1px dashed var(--psi-border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>📊</div>
              <h3 className="text-primary" style={{ margin: '0 0 var(--space-2) 0' }}>No Forecast Generated</h3>
              <p className="text-secondary" style={{ margin: 0 }}>Select a product category and forecast horizon to begin.</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <strong style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Error generating forecast</strong>
              <span>{error}</span>
            </div>
          )}

          {forecastResponse && (
            <>
              <ForecastSummary data={forecastResponse} />

              
              <div className="card" style={{ padding: 'var(--space-5)', width: '100%', overflowX: 'auto' }}>
                <h3 className="text-primary" style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.25rem' }}>Forecast vs Historical Sales</h3>
                <ForecastChart forecast={forecastResponse.forecast} historicalSales={historicalSales} />
              </div>

              
              <div className="card" style={{ padding: 'var(--space-5)', width: '100%', overflowX: 'auto' }}>
                <h3 className="text-primary" style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.25rem' }}>Forecast Details</h3>
                <ForecastTable forecast={forecastResponse.forecast} />
              </div>

              
              <ModelMetrics metrics={forecastResponse.metrics} />
              
              {qualityReport && (
                <QualityReportCard report={qualityReport} />
              )}

              <ExplanationPanel explanation={forecastResponse.explanation} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
                {!isCustomer && <OperationalDataPanel operationalData={operationalData} />}
                <RiskPanel risk={forecastResponse.risk} />
                <RecommendationPanel recommendations={forecastResponse.recommendations} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForecastDashboard;
