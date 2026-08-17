import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './Login';
import * as authApi from '../api/authApi';
import { AuthProvider } from '../context/AuthContext';

// Mock the API module
vi.mock('../api/authApi', () => ({
  login: vi.fn()
}));

const renderWithContext = (ui) => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login fields', () => {
    renderWithContext(<Login />);
    
    expect(screen.getByRole('heading', { name: /login to psi/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    
    const registerLink = screen.getByTestId('register-nav-link');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('successful login calls authApi and updates context', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const fakeToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' + 
                      btoa(JSON.stringify({ sub: 'test@test.com', role: 'ROLE_CUSTOMER', exp: futureExp })) + 
                      '.fake-sig';
    authApi.login.mockResolvedValue(fakeToken);

    renderWithContext(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/login successful/i);
    });

    // Check if context stored the token in localStorage
    expect(localStorage.getItem('jwt_token')).toBe(fakeToken);
  });

  it('failed login displays error message', async () => {
    authApi.login.mockRejectedValue(new Error('Invalid credentials'));

    renderWithContext(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });

    expect(localStorage.getItem('jwt_token')).toBeNull();
  });
});
