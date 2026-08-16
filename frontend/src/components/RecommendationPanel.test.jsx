import { render, screen } from '@testing-library/react';
import RecommendationPanel from './RecommendationPanel';
import { describe, it, expect } from 'vitest';

describe('RecommendationPanel', () => {
  it('renders correctly when recommendations exist', () => {
    const recs = [
      { strategy: 'Expedite', action: 'Air freight', reason: 'High risk', humanApprovalRequired: true }
    ];
    render(<RecommendationPanel recommendations={recs} />);

    expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Expedite')).toBeInTheDocument();
    expect(screen.getByText('Air freight')).toBeInTheDocument();
    expect(screen.getByText('High risk')).toBeInTheDocument();
  });

  it('explicitly communicates that human approval is required', () => {
    const recs = [
      { strategy: 'Expedite', action: 'Air freight', reason: 'High risk', humanApprovalRequired: true }
    ];
    render(<RecommendationPanel recommendations={recs} />);

    // The component renders: <p><strong>Human Approval Required:</strong> Yes</p>
    const approvalLabel = screen.getByText('Human Approval Required:');
    expect(approvalLabel.parentElement).toHaveTextContent('Yes');
  });

  it('explicitly communicates when human approval is NOT required', () => {
    const recs = [
      { strategy: 'Substitute', action: 'Use generic', reason: 'Low risk', humanApprovalRequired: false }
    ];
    render(<RecommendationPanel recommendations={recs} />);

    const approvalLabel = screen.getByText('Human Approval Required:');
    expect(approvalLabel.parentElement).toHaveTextContent('No');
  });

  it('renders gracefully when no recommendations are available', () => {
    render(<RecommendationPanel recommendations={[]} />);
    expect(screen.getByText('No AI recommendations available.')).toBeInTheDocument();
  });
});
