import { render, screen } from '@testing-library/react';
import ModelMetrics from './ModelMetrics';
import { describe, it, expect } from 'vitest';

describe('ModelMetrics', () => {
  it('renders numeric MAE correctly without %', () => {
    render(<ModelMetrics metrics={{ mae: 153.22, smape: 5.0, wape: 12.345 }} />);
    expect(screen.getByText('MAE').nextElementSibling).toHaveTextContent('153.22');
  });

  it('renders "N/A" for null MAE', () => {
    render(<ModelMetrics metrics={{ mae: null, smape: 5.0, wape: 12.345 }} />);
    expect(screen.getByText('MAE').nextElementSibling).toHaveTextContent('N/A');
  });

  it('renders "N/A" for missing/undefined MAE', () => {
    render(<ModelMetrics metrics={{ smape: 5.0, wape: 12.345 }} />);
    expect(screen.getByText('MAE').nextElementSibling).toHaveTextContent('N/A');
  });

  it('renders WAPE with correct two-decimal formatting and "%"', () => {
    render(<ModelMetrics metrics={{ mae: 153.22, smape: 5.0, wape: 12.345 }} />);
    expect(screen.getByText('WAPE').nextElementSibling).toHaveTextContent('12.35%');
  });

  it('renders sMAPE with correct two-decimal formatting and "%"', () => {
    render(<ModelMetrics metrics={{ mae: 153.22, smape: 5.0, wape: 12.345 }} />);
    expect(screen.getByText('sMAPE').nextElementSibling).toHaveTextContent('5.00%');
  });

  it('renders "No metrics available." when metrics prop is falsy', () => {
    render(<ModelMetrics metrics={null} />);
    expect(screen.getByText('No metrics available.')).toBeInTheDocument();
  });
});
