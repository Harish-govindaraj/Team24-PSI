import React from 'react';

function QualityReportCard({ report }) {
  if (!report) {
    return null;
  }

  const {
    category,
    modelType,
    modelVersion,
    trainedAt,
    nTrainingRows,
    demandClassification,
    classificationConfidence,
    confidence
  } = report;

  const formatValue = (num) => {
    if (num == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="card" style={{ padding: 'var(--space-5)', width: '100%', marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 className="text-primary" style={{ margin: 0, fontSize: '1.25rem' }}>AI Forecast Quality Report</h3>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '0.875rem', 
          fontWeight: 600,
          backgroundColor: confidence.category === 'High' ? 'var(--psi-color-success-bg)' : 
                          confidence.category === 'Medium' ? 'var(--psi-color-warning-bg)' : 
                          'var(--psi-color-danger-bg)',
          color: confidence.category === 'High' ? 'var(--psi-color-success-text)' : 
                confidence.category === 'Medium' ? 'var(--psi-color-warning-text)' : 
                'var(--psi-color-danger-text)'
        }}>
          {confidence.category} Confidence
        </span>
      </div>

      <div className="summary-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="summary-item">
          <span className="summary-label">Category</span>
          <span className="summary-value">{category}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Demand Classification</span>
          <span className="summary-value">{demandClassification}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--psi-text-muted)' }}>
            Confidence: {formatValue(classificationConfidence)}%
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Model Engine</span>
          <span className="summary-value">{modelType}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Training Data Volume</span>
          <span className="summary-value">{nTrainingRows} rows</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Last Trained</span>
          <span className="summary-value">{new Date(trainedAt).toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Reliability Score</span>
          <span className="summary-value">{formatValue(confidence.score)}/100</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Prediction Interval Coverage</span>
          <span className="summary-value">
            {confidence.picpAvailable 
              ? `${formatValue(confidence.meanPicp)}%` 
              : 'Unavailable'}
          </span>
          {confidence.picpAvailable && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--psi-text-muted)' }}>
              Target: {formatValue(confidence.picpTarget)}% ({confidence.picpSampleCount} samples)
            </span>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--psi-surface-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1rem' }}>Overall Assessment</h4>
        <p style={{ margin: 0, color: 'var(--psi-text-secondary)', fontSize: '0.9rem' }}>
          {confidence.reason}
        </p>
      </div>
    </div>
  );
}

export default QualityReportCard;
