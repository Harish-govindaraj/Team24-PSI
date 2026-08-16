import React from 'react';

function ExplanationPanel({ explanation }) {
  if (!explanation || explanation.length === 0) {
    return (
      <div className="explanation-card">
        <h3>AI Forecast Explanation</h3>
        <p>No AI explanation available.</p>
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

  return (
    <div className="explanation-card">
      <h3>AI Forecast Explanation</h3>
      <ul className="explanation-list">
        {explanation.map((item, index) => (
          <li key={index} className="explanation-item">
            <strong>{item.feature || 'Unknown Feature'}</strong>:            Importance {formatValue(item.importance)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExplanationPanel;
