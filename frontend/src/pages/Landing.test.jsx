import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Landing from './Landing';

describe('Landing Component', () => {
  const renderWithRouter = (ui) => {
    return render(
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    );
  };

  it('renders PSI branding', () => {
    renderWithRouter(<Landing />);
    expect(screen.getAllByText('PSI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pharma Sales Intelligence').length).toBeGreaterThan(0);
  });

  it('renders product description', () => {
    renderWithRouter(<Landing />);
    expect(screen.getAllByText(/AI-powered pharmaceutical sales intelligence for smarter demand forecasting/i).length).toBeGreaterThan(0);
  });

  it('renders Login CTA that navigates to /login', () => {
    renderWithRouter(<Landing />);
    // Testing multiple login links (nav and CTA)
    const loginLinks = screen.getAllByTestId('login-link');
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');
  });

  it('renders Register CTA that navigates to /register', () => {
    renderWithRouter(<Landing />);
    const registerLinks = screen.getAllByTestId('register-link');
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(registerLinks[0]).toHaveAttribute('href', '/register');
  });

  it('renders core capability sections', () => {
    renderWithRouter(<Landing />);
    expect(screen.getAllByText('Demand Forecasting').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Scenario Analysis').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Decision Intelligence').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operational Intelligence').length).toBeGreaterThan(0);
  });
});

