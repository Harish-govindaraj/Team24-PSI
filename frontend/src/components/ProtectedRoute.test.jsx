import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

// Mock the AuthContext hook
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

const renderWithRouter = (ui, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/dashboard" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('redirects to /login if unauthenticated', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: false,
      role: null
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      ['/dashboard']
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders content if authenticated and no specific roles are required', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_CUSTOMER'
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      ['/dashboard']
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders content if authenticated and role is allowed', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_PHARMA_SHOP_OWNER'
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ROLE_PHARMA_SHOP_OWNER', 'ROLE_ADMIN']}>
        <TestComponent />
      </ProtectedRoute>,
      ['/dashboard']
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows access denied if authenticated but role is NOT allowed', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_CUSTOMER'
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['ROLE_PHARMA_SHOP_OWNER', 'ROLE_ADMIN']}>
        <TestComponent />
      </ProtectedRoute>,
      ['/dashboard']
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission to view this page.')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login if authenticated but role is missing (defensive edge case)', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      role: null
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      ['/dashboard']
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
