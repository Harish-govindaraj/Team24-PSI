import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await apiLogin({ email, password });
      login(token);
      setSuccess('Login successful!');
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      setError(err.message || 'Login failed');
      setSuccess(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--psi-background)', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ margin: 0, color: 'var(--psi-primary)', fontSize: '1.75rem', letterSpacing: '-0.025em' }}>PSI</h1>
          <h2 style={{ margin: 'var(--space-2) 0 0 0', fontSize: '1.25rem', color: 'var(--psi-text-primary)' }}>Login to PSI</h2>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert" data-testid="login-error">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status" data-testid="login-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: 'var(--space-3)' }}>
            Login
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" data-testid="register-nav-link" style={{ color: 'var(--psi-primary)', fontWeight: 500, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
