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

function ForecastForm({ onSubmit, isLoading }) {
  const [category, setCategory] = useState('');
  const [horizon, setHorizon] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category && horizon) {
      onSubmit({ category, horizon: parseInt(horizon, 10) });
    }
  };

  return (
    <div className="forecast-form-card">
      <form onSubmit={handleSubmit} className="forecast-form">
        <div className="form-group">
          <label htmlFor="category">Product Category</label>
          <select            id="category"            value={category}            onChange={(e) => setCategory(e.target.value)}
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

        <div className="form-group">
          <label htmlFor="horizon">Forecast Horizon</label>
          <select            id="horizon"            value={horizon}            onChange={(e) => setHorizon(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="" disabled>Select horizon</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        <button          type="submit"          disabled={isLoading || !category || !horizon}
          className="generate-btn"
        >
          {isLoading ? 'Generating forecast...' : 'Generate Forecast'}
        </button>
      </form>
    </div>
  );
}

export default ForecastForm;
