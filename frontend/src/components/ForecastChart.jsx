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

function ForecastChart({ forecast, historicalSales = [] }) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="chart-card">
        <h3>Forecast Chart</h3>
        <p>No forecast data available.</p>
      </div>
    );
  }

  // Combine historical and forecast data by date
  const combinedDataMap = new Map();

  if (historicalSales && historicalSales.length > 0) {
    historicalSales.forEach((item) => {
      combinedDataMap.set(item.date, {
        date: item.date,
        salesQuantity: item.salesQuantity
      });
    });
  }

  forecast.forEach((point) => {
    const existing = combinedDataMap.get(point.date) || { date: point.date };
    existing.predictedSales = point.predictedSales;
    if (point.lowerBound != null && point.upperBound != null) {
      existing.interval = [point.lowerBound, point.upperBound];
    }
    combinedDataMap.set(point.date, existing);
  });

  // Convert to array and sort chronologically
  const chartData = Array.from(combinedDataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatValue = (value) => {
    if (value == null) return 'N/A';
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
                if (name === 'interval' || name === 'Confidence Interval') {
                  if (Array.isArray(value) && value.length === 2) {
                    return [`${formatValue(value[0])} - ${formatValue(value[1])}`, '95% Confidence Interval'];
                  }
                  return ['N/A', '95% Confidence Interval'];
                }
                return [formatValue(value), name];
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
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey="salesQuantity"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0f172a' }}
              activeDot={{ r: 5 }}
              name="Historical Sales"
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey="predictedSales"
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#2563eb' }}
              activeDot={{ r: 5 }}
              name="Predicted Sales"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastChart;
