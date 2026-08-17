import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { authenticatedFetch } from '../api/apiClient';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState({
    pendingVerifications: 0,
    totalUsers: 0,
    totalBusinesses: 0,
    activeProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await authenticatedFetch('/api/admin/dashboard/stats', { method: 'GET' });
        if (data) {
           setMetrics({
             pendingVerifications: data.pendingVerifications || 0,
             totalUsers: data.totalUsers || 0,
             totalBusinesses: data.totalBusinesses || 0,
             activeProducts: data.activeProducts || 0
           });
        }
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="admin-dashboard fade-in">
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 var(--space-2) 0', color: 'var(--psi-primary)', fontSize: '2rem' }}>Operations Overview</h1>
          <p style={{ margin: 0, color: 'var(--psi-text-muted)' }}>Welcome back, {user?.email}. Here's what's happening today.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--psi-warning)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Pending Verifications</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--psi-text-primary)' }}>
            {loading ? '...' : metrics.pendingVerifications}
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Link to="/admin/verifications" style={{ fontSize: '0.85rem', color: 'var(--psi-primary)', textDecoration: 'none', fontWeight: 600 }}>Review now &rarr;</Link>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--psi-success)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Total Users</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--psi-text-primary)', marginTop: 'var(--space-2)' }}>
            {loading ? '...' : metrics.totalUsers}
          </div>
          <div style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--psi-text-muted)' }}>
            Across all roles
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--psi-info)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Total Businesses</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--psi-text-primary)', marginTop: 'var(--space-2)' }}>
            {loading ? '...' : metrics.totalBusinesses}
          </div>
          <div style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--psi-text-muted)' }}>
            Pharmacies & Companies
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Active Products</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></span>
            {loading ? '...' : metrics.activeProducts}
          </div>
          <div style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--psi-text-muted)' }}>
            Configured forecasting categories
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--psi-primary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link to="/admin/verifications" className="btn btn-primary">Manage Verifications</Link>
            <Link to="/admin/users" className="btn btn-secondary">View All Users</Link>
            <Link to="/admin/products" className="btn btn-secondary">Manage Catalog</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
