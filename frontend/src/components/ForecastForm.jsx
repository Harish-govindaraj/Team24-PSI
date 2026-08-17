import React, { useState } from 'react';

// Hardcoded because the Spring Boot backend does not expose a category-list endpoint.
// This list mirrors the categories supported by the ML service.
const CATEGORIES = [
  { code: 'M01AB', label: 'Anti-inflammatory and antirheumatic products' },
  { code: 'M01AE', label: 'Propionic acid derivatives' },
  { code: 'N02BA', label: 'Salicylic acid and derivatives' },
  { code: 'N02BE', label: 'Other analgesics and antipyretics' },
  { code: 'N05B', label: 'Anxiolytics' },
  { code: 'N05C', label: 'Hypnotics and sedatives' },
  { code: 'R03', label: 'Drugs for obstructive airway diseases' },
  { code: 'R06', label: 'Antihistamines for systemic use' }
];

function ForecastForm({ onSubmit, isLoading, submitLabel = 'Generate Forecast', loadingLabel = 'Generating...' }) {
  const [category, setCategory] = useState('');
  const [horizon, setHorizon] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category && horizon) {
      onSubmit({ category, horizon: parseInt(horizon, 10) });
    }
  };

  return (
    <div>
      <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--psi-border)', margin: 'calc(var(--space-6) * -1) calc(var(--space-6) * -1) var(--space-4) calc(var(--space-6) * -1)' }}>
        <h3 className="card-title text-primary" style={{ fontSize: '1.1rem' }}>Configuration</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category" className="form-label">Product Category</label>
          <select id="category" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat.code} value={cat.code}>
                {cat.code} ({cat.label})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <label htmlFor="horizon" className="form-label">Forecast Horizon</label>
          <select id="horizon" className="form-control" value={horizon} onChange={(e) => setHorizon(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="" disabled>Select horizon</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading || !category || !horizon} className="btn btn-primary" style={{ width: '100%' }}>
          {isLoading ? loadingLabel : submitLabel}
        </button>
      </form>
    </div>
  );
}

export default ForecastForm;
