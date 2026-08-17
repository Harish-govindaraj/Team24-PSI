import React from 'react';

function ForecastSummary({ data }) {
  if (!data) return null;

  const horizon = data.horizon ? `${data.horizon} days` : 'N/A';
  const confidence = data.confidenceScore != null ? `${(data.confidenceScore * 100).toFixed(1)}%` : 'N/A';

  return (
    <div className="summary-card">
      <h3>Forecast Summary</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Category</span>
          <span className="summary-value">{data.category || 'N/A'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Model</span>
          <span className="summary-value">{data.model || 'N/A'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Model Version</span>
          <span className="summary-value">{data.modelVersion || 'N/A'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Forecast Horizon</span>
          <span className="summary-value">{horizon}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Confidence</span>
          <span className="summary-value">{confidence}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Trend</span>
          <span className="summary-value">{data.trend || 'N/A'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Seasonality</span>
          <span className="summary-value">{data.seasonality || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

export default ForecastSummary;
