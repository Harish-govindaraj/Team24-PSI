import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import * as AuthContextModule from '../context/AuthContext';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock useNavigate from React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Dashboard Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  };

  it('renders correctly for CUSTOMER role', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { email: 'customer@example.com' },
      role: 'ROLE_CUSTOMER',
      verificationStatus: 'VERIFIED',
      logout: mockLogout
    });

    renderDashboard();

    expect(screen.getByText('customer@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('customer-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('business-capabilities')).not.toBeInTheDocument();
  });

  it('renders correctly for pending verification status', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { email: 'pending@example.com' },
      role: 'ROLE_CUSTOMER',
      verificationStatus: 'PENDING_VERIFICATION',
      logout: mockLogout
    });

    renderDashboard();

    expect(screen.getByText('pending@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('customer-placeholder')).toBeInTheDocument();
    expect(screen.getByText('Verification: Pending')).toBeInTheDocument();
    expect(screen.getByText(/Your business-owner application is awaiting administrator verification/i)).toBeInTheDocument();
  });

  it('renders business capabilities for PHARMA_SHOP_OWNER role and navigates to forecast', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { email: 'shop@example.com' },
      role: 'ROLE_PHARMA_SHOP_OWNER',
      logout: mockLogout
    });

    renderDashboard();

    expect(screen.getByText('shop@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('business-capabilities')).toBeInTheDocument();
    expect(screen.getByText('Demand Forecasting')).toBeInTheDocument();
    expect(screen.queryByTestId('customer-placeholder')).not.toBeInTheDocument();

    const openForecastBtn = screen.getByTestId('open-forecast-btn');
    act(() => {
      openForecastBtn.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/forecast');
  });

  it('renders business capabilities for PHARMA_COMPANY_OWNER role', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { email: 'company@example.com' },
      role: 'ROLE_PHARMA_COMPANY_OWNER',
      logout: mockLogout
    });

    renderDashboard();

    expect(screen.getByText('company@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('business-capabilities')).toBeInTheDocument();
  });

  it('renders admin verification CTA for ROLE_ADMIN', () => {
    AuthContextModule.useAuth.mockReturnValue({
      user: { email: 'admin@example.com' },
      role: 'ROLE_ADMIN',
      logout: mockLogout
    });

    renderDashboard();

    expect(screen.getByTestId('admin-placeholder')).toBeInTheDocument();
    expect(screen.getByText('Business Verification')).toBeInTheDocument();
    expect(screen.getByTestId('open-verification-btn')).toBeInTheDocument();
    expect(screen.queryByTestId('business-capabilities')).not.toBeInTheDocument();
  });

});
