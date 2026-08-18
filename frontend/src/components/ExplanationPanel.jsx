import React from 'react';

function ExplanationPanel({ explanation }) {
  if (!explanation || !explanation.available) {
    return (
      <div className="explanation-card">
        <h3>AI Forecast Explanation</h3>
        <p>{explanation?.reason || "Feature explanation unavailable."}</p>
      </div>
    );
  }

  const formatValue = (num) => {
    if (num == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(num);
  };

  if (explanation.method === "heuristic") {
    return (
      <div className="explanation-card">
        <h3>AI Forecast Explanation</h3>
        <p className="heuristic-reason">{explanation.reason}</p>
      </div>
    );
  }

  return (
    <div className="explanation-card">
      <h3>AI Forecast Explanation</h3>
      <ul className="explanation-list">
        {(explanation.topFeatures || []).map((item, index) => (
          <li key={index} className="explanation-item">
            <strong>{item.feature || 'Unknown Feature'}</strong>: Importance {formatValue(item.importance)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExplanationPanel;
