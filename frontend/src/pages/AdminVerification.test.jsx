import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AdminVerification from './AdminVerification';
import * as apiClient from '../api/apiClient';

vi.mock('../api/apiClient', () => ({
  authenticatedFetch: vi.fn()
}));

const mockLogout = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

import { useAuth } from '../context/AuthContext';

const renderWithContext = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('AdminVerification Component', () => {
  const authValue = {
    user: { email: 'admin@example.com' },
    role: 'ROLE_ADMIN',
    logout: mockLogout,
    verificationStatus: 'VERIFIED'
  };

  const mockPendingApps = [
    {
      id: 1,
      fullName: 'Alice Shop',
      email: 'alice@shop.com',
      phoneNumber: '1234567890',
      businessName: 'Alice Pharmacy',
      businessRegistrationId: 'REG123',
      requestedRole: 'PHARMA_SHOP_OWNER',
      verificationStatus: 'PENDING_VERIFICATION',
      createdAt: '2023-01-01T10:00:00Z'
    },
    {
      id: 2,
      fullName: 'Bob Company',
      email: 'bob@company.com',
      phoneNumber: '0987654321',
      businessName: 'Bob Corp',
      businessRegistrationId: 'CORP456',
      requestedRole: 'PHARMA_COMPANY_OWNER',
      verificationStatus: 'PENDING_VERIFICATION',
      createdAt: '2023-01-02T10:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(authValue);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', async () => {
    apiClient.authenticatedFetch.mockReturnValue(new Promise(() => {})); // Never resolves to keep loading state
    
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders empty state when no applications are pending', async () => {
    apiClient.authenticatedFetch.mockResolvedValue([]);
    
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No pending verification applications')).toBeInTheDocument();
  });

  it('renders pending applications and formats roles correctly', async () => {
    apiClient.authenticatedFetch.mockResolvedValue(mockPendingApps);
    
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    expect(screen.getByTestId('application-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('applicant-name-1')).toHaveTextContent('Alice Shop');
    expect(screen.getByTestId('requested-role-1')).toHaveTextContent('Pharmacy Shop Owner');

    expect(screen.getByTestId('application-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('applicant-name-2')).toHaveTextContent('Bob Company');
    expect(screen.getByTestId('requested-role-2')).toHaveTextContent('Pharmacy Company Owner');
  });

  it('approve button calls API and refreshes list', async () => {
    apiClient.authenticatedFetch
      .mockResolvedValueOnce(mockPendingApps) // First fetch
      .mockResolvedValueOnce({ success: true }) // Approve POST
      .mockResolvedValueOnce([mockPendingApps[1]]); // Refetch after approve
      
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    expect(screen.getByTestId('approve-btn-1')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('approve-btn-1'));
    });

    expect(apiClient.authenticatedFetch).toHaveBeenCalledWith('/api/admin/verifications/1/approve', { method: 'POST' });
    
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toHaveTextContent('Application approved successfully for Alice Shop.');
    });
    
    expect(apiClient.authenticatedFetch).toHaveBeenCalledTimes(3);
  });

  it('reject button opens confirmation dialog', async () => {
    apiClient.authenticatedFetch.mockResolvedValue(mockPendingApps);
    
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('reject-btn-1'));
    });

    expect(screen.getByTestId('confirm-reject-dialog-1')).toBeInTheDocument();
    expect(screen.queryByTestId('approve-btn-1')).not.toBeInTheDocument();
  });

  it('confirming reject calls API and refreshes list', async () => {
    apiClient.authenticatedFetch
      .mockResolvedValueOnce(mockPendingApps) // First fetch
      .mockResolvedValueOnce({ success: true }) // Reject POST
      .mockResolvedValueOnce([mockPendingApps[1]]); // Refetch after reject
      
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    // Open confirmation
    await act(async () => {
      fireEvent.click(screen.getByTestId('reject-btn-1'));
    });

    // Confirm rejection
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-reject-btn-1'));
    });

    expect(apiClient.authenticatedFetch).toHaveBeenCalledWith('/api/admin/verifications/1/reject', { method: 'POST' });
    
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toHaveTextContent('Application rejected successfully for Alice Shop.');
    });
  });

  it('canceling reject closes confirmation dialog', async () => {
    apiClient.authenticatedFetch.mockResolvedValue(mockPendingApps);
    
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    // Open confirmation
    await act(async () => {
      fireEvent.click(screen.getByTestId('reject-btn-1'));
    });

    // Cancel rejection
    await act(async () => {
      fireEvent.click(screen.getByTestId('cancel-reject-btn-1'));
    });

    expect(screen.queryByTestId('confirm-reject-dialog-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('approve-btn-1')).toBeInTheDocument();
    expect(apiClient.authenticatedFetch).toHaveBeenCalledTimes(1); // Only the initial fetch
  });

  it('renders API error message safely', async () => {
    apiClient.authenticatedFetch.mockRejectedValue(new Error('Backend safely formatted error'));
    
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent('Backend safely formatted error');
  });

  it('refresh button triggers new request', async () => {
    apiClient.authenticatedFetch.mockResolvedValue(mockPendingApps);
    
    await act(async () => {
      renderWithContext(<AdminVerification />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh-btn'));
    });

    expect(apiClient.authenticatedFetch).toHaveBeenCalledTimes(2);
  });

});
