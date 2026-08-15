import React from 'react';
import ForecastDashboard from './pages/ForecastDashboard';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>PSI</h1>
        <p>Pharma Sales Intelligence</p>
      </header>
      
      <main>
        <ForecastDashboard />
      </main>
    </div>
  );
}

export default App;
