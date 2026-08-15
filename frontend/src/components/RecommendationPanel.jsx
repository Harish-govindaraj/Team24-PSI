import React from 'react';

function RecommendationPanel({ recommendation }) {
  if (!recommendation) {
    return (
      <div className="recommendation-card">
        <h3>AI Recommendation</h3>
        <p>No recommendation available.</p>
      </div>
    );
  }

  return (
    <div className="recommendation-card">
      <h3>AI Recommendation</h3>
      <div className="recommendation-content">
        <p><strong>Strategy:</strong> {recommendation.strategy || 'N/A'}</p>
        <p><strong>Action:</strong> {recommendation.action || 'N/A'}</p>
        <p><strong>Reason:</strong> {recommendation.reason || 'N/A'}</p>
        <p><strong>Human Approval Required:</strong> {recommendation.humanApprovalRequired ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

export default RecommendationPanel;
