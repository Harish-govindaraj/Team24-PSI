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

  return (
    <div className="table-card">
      <h3>Forecast Details</h3>
      <div className="table-responsive">
        <table className="forecast-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Predicted Sales</th>
              <th>Lower Bound</th>
              <th>Upper Bound</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((point, index) => (
              <tr key={index}>
                <td>{point.date || 'N/A'}</td>
                <td>{formatNumber(point.predictedSales)}</td>
                <td>{formatNumber(point.lowerBound)}</td>
                <td>{formatNumber(point.upperBound)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ForecastTable;
