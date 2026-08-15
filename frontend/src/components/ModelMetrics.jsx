import React from 'react';

function ModelMetrics({ metrics }) {
  if (!metrics) {
    return (
      <div className="metrics-card">
        <h3>Model Metrics</h3>
        <p>No metrics available.</p>
      </div>
    );
  }

  const formatValue = (num) => {
    if (num == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="metrics-card">
      <h3>Model Metrics</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">MAE</span>
          <span className="summary-value">{formatValue(metrics.mae)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">sMAPE</span>
          <span className="summary-value">{formatValue(metrics.smape)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">WAPE</span>
          <span className="summary-value">{formatValue(metrics.wape)}</span>
        </div>
      </div>
    </div>
  );
}

export default ModelMetrics;
