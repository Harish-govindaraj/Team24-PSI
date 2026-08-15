import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

function ForecastChart({ forecast }) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="chart-card">
        <h3>Forecast Chart</h3>
        <p>No forecast data available.</p>
      </div>
    );
  }

  // Transform data for Recharts (Recharts Area works well when we give it [lower, upper] as dataKey)
  // However, simpler is just filling lowerBound to upperBound using two areas or an Area with an array value.
  // We will map the data to include an array for the confidence interval.
  const chartData = forecast.map((point) => ({
    date: point.date,
    predictedSales: point.predictedSales,
    interval: [point.lowerBound, point.upperBound]
  }));

  const formatValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="chart-card">
      <h3>Forecast Chart</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
            <YAxis tickFormatter={formatValue} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'interval') {
                  return [`${formatValue(value[0])} - ${formatValue(value[1])}`, '95% Confidence Interval'];
                }
                return [formatValue(value), 'Predicted Sales'];
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36}/>
            
            <Area 
              type="monotone" 
              dataKey="interval" 
              fill="#bfdbfe" 
              stroke="none" 
              name="Confidence Interval" 
            />
            
            <Line 
              type="monotone" 
              dataKey="predictedSales" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#2563eb' }} 
              activeDot={{ r: 5 }} 
              name="Predicted Sales" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastChart;
