import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// A simple test component that consumes the context
const TestComponent = () => {
  const { token, user, role, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="is-auth">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="email">{user ? user.email : 'null'}</div>
      <div data-testid="role">{role || 'null'}</div>
      <button data-testid="login-btn" onClick={() => login(window.testToken)}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

// Helper to create a fake JWT string
const createFakeJwt = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signature = 'fake-signature';
  return `${header}.${body}.${signature}`;
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    window.testToken = null;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides initial unauthenticated state when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-auth').textContent).toBe('no');
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('email').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('null');
  });

  it('logs in successfully with a valid JWT', () => {
    const validToken = createFakeJwt({
      sub: 'user@email.com',
      role: 'ROLE_CUSTOMER',
      exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
    });

    window.testToken = validToken;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('is-auth').textContent).toBe('yes');
    expect(screen.getByTestId('token').textContent).toBe(validToken);
    expect(screen.getByTestId('email').textContent).toBe('user@email.com');
    expect(screen.getByTestId('role').textContent).toBe('ROLE_CUSTOMER');
    expect(localStorage.getItem('jwt_token')).toBe(validToken);
  });

  it('clears state and localStorage on logout', () => {
    const validToken = createFakeJwt({
      sub: 'user@email.com',
      role: 'ROLE_CUSTOMER',
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    // Set localStorage to simulate already logged in state
    localStorage.setItem('jwt_token', validToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify initially logged in
    expect(screen.getByTestId('is-auth').textContent).toBe('yes');

    act(() => {
      screen.getByTestId('logout-btn').click();
    });

    // Verify logged out
    expect(screen.getByTestId('is-auth').textContent).toBe('no');
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('email').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('null');
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('rejects an invalid JWT format and remains unauthenticated', () => {
    window.testToken = 'not.a.valid.jwt';

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('is-auth').textContent).toBe('no');
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('automatically rejects an expired JWT', () => {
    const expiredToken = createFakeJwt({
      sub: 'user@email.com',
      role: 'ROLE_CUSTOMER',
      exp: Math.floor(Date.now() / 1000) - 3600 // expired 1 hour ago
    });

    window.testToken = expiredToken;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('is-auth').textContent).toBe('no');
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('logs out automatically when auth:unauthorized event is dispatched', () => {
    const validToken = createFakeJwt({
      sub: 'user@email.com',
      role: 'ROLE_CUSTOMER',
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    // Set localStorage to simulate already logged in state
    localStorage.setItem('jwt_token', validToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify initially logged in
    expect(screen.getByTestId('is-auth').textContent).toBe('yes');

    act(() => {
      window.dispatchEvent(new Event('auth:unauthorized'));
    });

    // Verify logged out
    expect(screen.getByTestId('is-auth').textContent).toBe('no');
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });
});
