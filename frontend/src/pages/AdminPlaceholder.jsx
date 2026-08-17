import React from 'react';
import { Link } from 'react-router-dom';

const AdminPlaceholder = ({ title, icon, description }) => {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>{icon}</div>
      <h1 style={{ color: 'var(--psi-primary)', margin: '0 0 var(--space-3) 0', fontSize: '2rem' }}>{title}</h1>
      <p style={{ color: 'var(--psi-text-muted)', maxWidth: '500px', margin: '0 auto var(--space-6) auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
        {description}
      </p>
      <div className="alert alert-info" style={{ maxWidth: '600px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: '0 auto var(--space-6) auto' }}>
        <span style={{ fontSize: '1.25rem' }}>🚀</span>
        <div style={{ textAlign: 'left' }}>
          <strong>Coming in Q4</strong>
          <div style={{ fontSize: '0.9rem' }}>This feature is currently under active development as part of the Phase 8 roadmap.</div>
        </div>
      </div>
      <Link to="/admin" className="btn btn-primary">Return to Dashboard</Link>
    </div>
  );
};

export default AdminPlaceholder;
