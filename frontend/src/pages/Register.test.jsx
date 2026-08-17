import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Register from './Register';
import * as authApi from '../api/authApi';

vi.mock('../api/authApi', () => ({
  register: vi.fn()
}));

const renderWithRouter = (ui) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders common fields by default for CUSTOMER', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByRole('heading', { name: /register for psi/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    
    // Admin should not exist
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    
    // Business fields should be hidden by default
    expect(screen.queryByTestId('business-fields')).not.toBeInTheDocument();
    
    const loginLink = screen.getByTestId('login-nav-link');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows shop owner fields when PHARMA_SHOP_OWNER is selected', () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'PHARMA_SHOP_OWNER' } });
    
    expect(screen.getByTestId('business-fields')).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shop name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shop registration id/i)).toBeInTheDocument();
  });

  it('shows company owner fields when PHARMA_COMPANY_OWNER is selected', () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'PHARMA_COMPANY_OWNER' } });
    
    expect(screen.getByTestId('business-fields')).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company registration id/i)).toBeInTheDocument();
  });

  it('calls authApi.register with correct payload for CUSTOMER', async () => {
    authApi.register.mockResolvedValue({ success: true });

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(authApi.register).toHaveBeenCalledWith({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'securepass',
      requestedRole: 'CUSTOMER'
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/registration successful/i);
    });
  });

  it('calls authApi.register with correct payload for business owner', async () => {
    authApi.register.mockResolvedValue({ success: true });

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@shop.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepass' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'PHARMA_SHOP_OWNER' } });
    
    // Business fields
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/shop name/i), { target: { value: 'Jane Shop' } });
    fireEvent.change(screen.getByLabelText(/shop registration id/i), { target: { value: 'REG-123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(authApi.register).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      email: 'jane@shop.com',
      password: 'securepass',
      requestedRole: 'PHARMA_SHOP_OWNER',
      phoneNumber: '1234567890',
      businessName: 'Jane Shop',
      businessRegistrationId: 'REG-123'
    });

    await waitFor(() => {
      // Just waiting for the state to settle
      expect(screen.getByRole('status')).toHaveTextContent(/registration successful/i);
    });
  });
  
  it('displays error message when registration fails', async () => {
    authApi.register.mockRejectedValue(new Error('Email already in use'));

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email already in use/i);
    });
  });
});
