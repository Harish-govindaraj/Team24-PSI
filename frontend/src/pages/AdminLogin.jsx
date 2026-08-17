import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct fetch to our new dedicated endpoint instead of using the general auth context login first,
      // because we want to fail fast if it's not an admin.
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (_e) {
        throw new Error('Received an invalid response from the backend.');
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      if (!data?.data?.user || !data?.data?.token) {
        throw new Error('Unexpected response format from admin authentication.');
      }

      if (data.data.user.role !== 'ROLE_ADMIN') {
        throw new Error('Administrator access is required.');
      }
      
      login(data.data.token);
      
      navigate('/admin', { replace: true });

    } catch (err) {
      setError(err.message || 'Invalid credentials or unauthorized access.');
      // If they managed to login but weren't admin, context is hydrated. We shouldn't let them stay.
      // But the requirement says "DO NOT allow them into the Admin Console."
      // The context handles standard logout if we need to purge it, or we just leave them logged in 
      // as a customer but unable to access the admin page. The instructions say "Display a clear message... Return to PSI".
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--psi-background)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: 'var(--space-8)', borderTop: '4px solid var(--psi-primary)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <h1 style={{ color: 'var(--psi-primary)', margin: '0 0 var(--space-2) 0', fontSize: '2rem', letterSpacing: '-0.025em' }}>PSI</h1>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--psi-text-primary)', margin: '0 0 var(--space-2) 0' }}>ADMINISTRATION PORTAL</h2>
            <p style={{ color: 'var(--psi-text-muted)', fontSize: '0.9rem', margin: 0 }}>Secure access to PSI operations</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>{error}</div>
              {error === 'Administrator access is required.' && (
                <Link to="/" className="btn btn-secondary" style={{ textAlign: 'center' }}>Return to PSI</Link>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)' }}>
              {loading ? 'Authenticating...' : 'Sign in to Admin Console'}
            </button>
          </form>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Return to PSI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
