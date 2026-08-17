import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css'; // Reusing layout CSS for structure

const AdminLayout = ({ children }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="layout-container" style={{ '--psi-primary': '#0f172a' }}> {/* Darker enterprise hue for admin */}
      <nav className="sidebar" style={{ backgroundColor: 'var(--psi-surface)', borderRight: '1px solid var(--psi-border)' }}>
        <div className="sidebar-header" style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--psi-border)' }}>
          <h2 style={{ margin: 0, color: 'var(--psi-primary)', fontSize: '1.75rem', letterSpacing: '-0.025em' }}>PSI ADMIN</h2>
          <span className="sidebar-subtitle" style={{ color: 'var(--psi-text-muted)', fontSize: '0.85rem' }}>Operations Console</span>
        </div>
        
        <div className="sidebar-nav" style={{ padding: 'var(--space-4) 0' }}>
          <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">📊</span>
            Overview
          </NavLink>

          <NavLink to="/admin/verifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🛡️</span>
            Business Verification
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            Users
          </NavLink>

          <NavLink to="/admin/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📦</span>
            Product Catalog
          </NavLink>

          <div style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', borderTop: '1px solid var(--psi-border)' }}>
            <div style={{ color: 'var(--psi-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, padding: 'var(--space-2) var(--space-6)' }}>System</div>
            <a href="#" className="nav-item" style={{ cursor: 'not-allowed', opacity: 0.5 }} onClick={(e) => e.preventDefault()}>
              <span className="nav-icon">⚙️</span>
              Settings
            </a>
          </div>
        </div>

        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--psi-border)', padding: 'var(--space-4)' }}>
          <div className="user-info" style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-primary)', fontWeight: 600 }}>Admin</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--psi-text-muted)' }}>{user?.email}</div>
            <div style={{ marginTop: 'var(--space-2)' }}><span className="badge badge-danger">ROLE_ADMIN</span> <span className="badge badge-success">Verified</span></div>
          </div>
          <button className="btn btn-secondary logout-btn" onClick={handleLogout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content" style={{ backgroundColor: '#f8fafc', overflowY: 'auto' }}>
        <div style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
