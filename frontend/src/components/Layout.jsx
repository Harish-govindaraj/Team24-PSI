import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const isShopOwner = role === 'ROLE_PHARMA_SHOP_OWNER';
  const isCompanyOwner = role === 'ROLE_PHARMA_COMPANY_OWNER';
  const isAdmin = role === 'ROLE_ADMIN';

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>PSI</h2>
          <span className="sidebar-subtitle">Pharma Sales Intelligence</span>
        </div>
        
        <div className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>

          {role !== 'ROLE_ADMIN' && (
            <NavLink to="/forecast" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📈</span>
              Forecast Intelligence
            </NavLink>
          )}

          {isCompanyOwner && (
            <NavLink to="/scenario-analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📉</span>
              Scenario Analysis
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/verifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">🛡️</span>
              Admin Verification
            </NavLink>
          )}
        </div>

        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--psi-border)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="user-info" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--psi-primary)' }}>{user?.fullName || user?.email}</span>
            <span className="user-email" style={{ fontSize: '0.85rem', color: 'var(--psi-text-secondary)', wordBreak: 'break-all' }}>{user?.email}</span>
            <span className="user-role-badge badge badge-info" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-1)', fontSize: '0.7rem' }}>
              {role?.replace('ROLE_', '')?.replace(/_/g, ' ')}
            </span>
          </div>
          <button className="btn btn-secondary logout-btn" onClick={handleLogout} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
