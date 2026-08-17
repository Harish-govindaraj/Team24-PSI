import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../api/apiClient';

const AdminSettings = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authenticatedFetch('/api/admin/health', { method: 'GET' });
      setHealthStatus(data || {});
    } catch (err) {
      setError(err.message || 'Failed to connect to health endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const StatusIndicator = ({ status }) => {
    const isUp = status === 'UP';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div style={{
          width: '12px', height: '12px', borderRadius: '50%',
          backgroundColor: isUp ? 'var(--psi-success)' : 'var(--psi-danger)'
        }}></div>
        <span style={{ fontWeight: 'bold', color: isUp ? 'var(--psi-success)' : 'var(--psi-danger)' }}>
          {status || 'UNKNOWN'}
        </span>
      </div>
    );
  };

  return (
    <div>
      <section className="mb-6" style={{ borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-4)' }}>
        <h1 className="text-primary mb-2" style={{ fontSize: '1.75rem' }}>System Settings</h1>
        <p className="text-secondary" style={{ margin: 0 }}>Configure platform variables and monitor system health.</p>
      </section>

      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* System Health Section */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 className="text-primary" style={{ margin: 0, fontSize: '1.25rem' }}>System Health</h2>
            <button className="btn btn-secondary" style={{ padding: 'var(--space-1) var(--space-3)' }} onClick={fetchHealth} disabled={loading}>
              {loading ? 'Pinging...' : 'Refresh'}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-2)' }}>
              <span style={{ fontWeight: '500' }}>Spring Boot Backend</span>
              <StatusIndicator status={healthStatus?.backend} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-2)' }}>
              <span style={{ fontWeight: '500' }}>MySQL Database</span>
              <StatusIndicator status={healthStatus?.database} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-2)' }}>
              <span style={{ fontWeight: '500' }}>FastAPI ML Service</span>
              <StatusIndicator status={healthStatus?.mlService} />
            </div>
          </div>
        </div>

        {/* Security Settings Placeholder */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 className="text-primary mb-4" style={{ marginTop: 0, fontSize: '1.25rem' }}>Security Policies</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">JWT Expiration (Hours)</label>
              <input type="number" className="form-control" defaultValue="2" disabled />
              <small className="text-secondary">Requires server restart to apply.</small>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input type="checkbox" id="mfa" disabled />
              <label htmlFor="mfa" style={{ margin: 0 }}>Enforce MFA for Administrators</label>
            </div>
            <button type="button" className="btn btn-secondary mt-4" disabled>Update Policies</button>
          </form>
        </div>

        {/* Forecast Settings Placeholder */}
        <div className="card" style={{ padding: 'var(--space-6)', gridColumn: '1 / -1' }}>
          <h2 className="text-primary mb-4" style={{ marginTop: 0, fontSize: '1.25rem' }}>Forecasting Engine Configuration</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <div className="form-group">
              <label className="form-label">Default Model</label>
              <select className="form-control" disabled>
                <option>LightGBM</option>
                <option>SARIMA</option>
                <option>Ensemble</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Confidence Interval (%)</label>
              <select className="form-control" disabled>
                <option>95%</option>
                <option>90%</option>
                <option>99%</option>
              </select>
            </div>
          </div>
          <button type="button" className="btn btn-secondary mt-2" disabled>Save Configuration</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
