import React from 'react';

function ForecastTable({ forecast }) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="table-card">
        <h3>Forecast Details</h3>
        <p>No forecast data available.</p>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const hasBounds = forecast.some(p => p.lowerBound != null || p.upperBound != null);

  return (
    <div className="table-card">
      <h3>Forecast Details</h3>
      <div className="table-responsive">
        <table className="forecast-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Predicted Sales</th>
              <th>Prediction Interval</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((point, index) => (
              <tr key={index}>
                <td>{point.date || 'N/A'}</td>
                <td>{formatNumber(point.predictedSales)}</td>
                <td>
                  {point.lowerBound != null && point.upperBound != null
                    ? `${formatNumber(point.lowerBound)} - ${formatNumber(point.upperBound)}`
                    : <span style={{ color: 'var(--psi-text-muted)', fontStyle: 'italic' }}>Prediction interval unavailable for this model</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ForecastTable;
