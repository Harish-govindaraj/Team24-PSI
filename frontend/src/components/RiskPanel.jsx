import React from 'react';

function RiskPanel({ risk }) {
  if (!risk) {
    return (
      <div className="card risk-card">
        <h3 className="card-title text-primary">Risk Assessment</h3>
        <p>No information available.</p>
      </div>
    );
  }

  // Visually distinguish risk levels if they match known keywords
  let levelColor = '#64748b'; // default slate
  const level = (risk.level || '').toUpperCase();
  if (level === 'LOW') levelColor = '#10b981';
  else if (level === 'MEDIUM') levelColor = '#f59e0b';
  else if (level === 'HIGH') levelColor = '#ef4444';
  else if (level === 'CRITICAL') levelColor = '#991b1b';

  return (
    <div className="card risk-card">
      <h3 className="card-title text-primary">Risk Assessment</h3>
      <div className="risk-content">
        <p>
          <strong>Risk Level:</strong>{' '}
          <span style={{ color: levelColor, fontWeight: 'bold' }}>{risk.level || 'N/A'}</span>
        </p>
        <p><strong>Type:</strong> {risk.type || 'N/A'}</p>
        <p><strong>Score:</strong> {risk.score != null ? risk.score : 'N/A'}</p>
        <p><strong>Reason:</strong> {risk.reason || 'N/A'}</p>
        <p><strong>Average Daily Demand:</strong> {risk.avgDailyDemand != null ? `${risk.avgDailyDemand} units` : 'N/A'}</p>
        <p><strong>Days of Supply:</strong> {risk.daysOfSupply != null ? `${risk.daysOfSupply} days` : 'N/A'}</p>
      </div>
    </div>
  );
}

export default RiskPanel;
