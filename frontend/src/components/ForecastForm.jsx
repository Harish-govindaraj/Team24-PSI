import React, { useState } from 'react';

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
          <select 
            id="category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="" disabled>Select a category</option>
            <option value="R03">R03 (Drugs for Obstructive Airway Diseases)</option>
            <option value="N05C">N05C (Hypnotics and Sedatives)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="horizon">Forecast Horizon</label>
          <select 
            id="horizon" 
            value={horizon} 
            onChange={(e) => setHorizon(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="" disabled>Select horizon</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !category || !horizon}
          className="generate-btn"
        >
          {isLoading ? 'Generating forecast...' : 'Generate Forecast'}
        </button>
      </form>
    </div>
  );
}

export default ForecastForm;
