import { render, screen } from '@testing-library/react';
import ForecastChart from './ForecastChart';
import { describe, it, expect, vi } from 'vitest';

// Mock recharts to prevent ResponsiveContainer from failing in jsdom
// and to avoid brittle SVG tests.
vi.mock('recharts', async () => {
  const OriginalRecharts = await vi.importActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
    Line: () => <div data-testid="recharts-line" />,
    Area: () => <div data-testid="recharts-area" />
  };
});

describe('ForecastChart', () => {
  it('renders correctly with historical and forecast data', () => {
    const historical = [{ date: '2024-01-01', salesQuantity: 100 }];
    const forecast = [{ date: '2024-01-02', predictedSales: 120 }];

    render(<ForecastChart historicalSales={historical} forecast={forecast} />);
    expect(screen.getByText('Forecast Chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles missing/null confidence bounds safely', () => {
    const forecast = [{ date: '2024-01-02', predictedSales: 120, lowerBound: null, upperBound: null }];
    render(<ForecastChart forecast={forecast} />);
    
    // Area for confidence interval should not render
    expect(screen.queryByTestId('recharts-area')).not.toBeInTheDocument();
  });

  it('renders confidence interval area when lower/upper bounds exist', () => {
    const forecast = [{ date: '2024-01-02', predictedSales: 120, lowerBound: 100, upperBound: 140 }];
    render(<ForecastChart forecast={forecast} />);
    
    // Area for confidence interval should render
    expect(screen.getByTestId('recharts-area')).toBeInTheDocument();
  });

  it('renders "No forecast data available" when forecast is empty', () => {
    render(<ForecastChart forecast={[]} />);
    expect(screen.getByText('No forecast data available.')).toBeInTheDocument();
  });
});
