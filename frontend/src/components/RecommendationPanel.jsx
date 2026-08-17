import React from 'react';

function RecommendationPanel({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendation-card">
        <h3>AI Recommendations</h3>
        <p>No AI recommendations available.</p>
      </div>
    );
  }

  return (
    <div className="recommendation-card">
      <h3>AI Recommendations</h3>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-content" style={{ marginBottom: index < recommendations.length - 1 ? '1rem' : '0', paddingBottom: index < recommendations.length - 1 ? '1rem' : '0', borderBottom: index < recommendations.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
            <p><strong>Strategy:</strong> {rec.strategy || 'N/A'}</p>
            <p><strong>Action:</strong> {rec.action || 'N/A'}</p>
            <p><strong>Reason:</strong> {rec.reason || 'N/A'}</p>
            <p><strong>Human Approval Required:</strong> {rec.humanApprovalRequired ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendationPanel;
