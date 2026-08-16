import { render, screen, fireEvent } from '@testing-library/react';
import ScenarioPanel from './ScenarioPanel';
import { describe, it, expect, vi } from 'vitest';

describe('ScenarioPanel', () => {
  it('respects supply-shock boundary behavior on slider', () => {
    const handleRun = vi.fn();
    render(<ScenarioPanel category="R03" horizon={14} onRunScenario={handleRun} />);

    const slider = screen.getByLabelText(/Supply Shock \(Inventory Lost\)/i);
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '0.95');
    
    // Fire event to change to 0.75
    fireEvent.change(slider, { target: { value: '0.75' } });
    expect(slider).toHaveValue('0.75');
    
    const runButton = screen.getByRole('button', { name: /Run Simulation/i });
    fireEvent.click(runButton);
    
    expect(handleRun).toHaveBeenCalledWith(expect.objectContaining({
      supplyShockPct: 0.75
    }));
  });

  it('displays percentage formatting correctly for supply shock input', () => {
    render(<ScenarioPanel category="R03" horizon={14} />);
    // Default is 0.3 -> 30%
    expect(screen.getByText(/Supply Shock \(Inventory Lost\):/)).toHaveTextContent('30%');
  });

  it('formats stockout-probability correctly when result is provided', () => {
    const mockResult = {
      supplyShockPct: 0.45,
      nSimulations: 200,
      stockoutProbability: 0.756,
      meanShortfallUnits: 120
    };

    render(<ScenarioPanel category="R03" horizon={14} result={mockResult} loading={false} />);
    
    expect(screen.getByText('Stockout Probability').nextElementSibling).toHaveTextContent('75.6%');
    expect(screen.getByText('Supply Shock').nextElementSibling).toHaveTextContent('45%');
  });

  it('handles loading state correctly', () => {
    render(<ScenarioPanel category="R03" horizon={14} loading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Running Simulation...');
  });

  it('displays API error safely', () => {
    render(<ScenarioPanel category="R03" horizon={14} error="Network failure" />);
    expect(screen.getByText('Network failure')).toBeInTheDocument();
  });
});
