import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MedicineCatalog from '../components/MedicineCatalog';

const Dashboard = () => {
  const { user, role, verificationStatus } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <section className="mb-8" style={{ borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-6)' }}>
        <h1 className="text-primary" style={{ margin: '0 0 var(--space-1) 0', fontSize: '2.5rem', letterSpacing: '-0.025em', fontWeight: 'bold' }}>
          Welcome back, <br/>
          <span style={{ color: 'var(--psi-secondary)' }}>{user?.fullName || user?.email}</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: '1.2rem', margin: '0 0 var(--space-5) 0', opacity: 0.8 }}>
          Your personalized PSI workspace
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Status</span>
            <span className="badge badge-success">Online & Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Level</span>
            <span className="badge badge-info">{role ? role.replace('ROLE_', '').replace(/_/g, ' ') : 'N/A'}</span>
          </div>
        </div>
      </section>

      {(role === 'ROLE_PHARMA_SHOP_OWNER' || role === 'ROLE_PHARMA_COMPANY_OWNER') && (
        <section data-testid="business-capabilities" className="mb-8">
          <h2 className="text-primary mb-4" style={{ fontSize: '1.5rem' }}>Enterprise Capabilities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--psi-primary)' }}>
              <h3 className="card-title text-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '1.5rem' }}>📈</span> Demand Forecasting
              </h3>
              <p className="text-secondary" style={{ flexGrow: 1, marginBottom: 'var(--space-5)' }}>
                Predict future pharmaceutical demand using advanced ML models.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/forecast')} data-testid="open-forecast-btn" style={{ width: '100%' }}>
                Open Forecast Workspace
              </button>
            </div>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--psi-primary)' }}>
              <h3 className="card-title text-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '1.5rem' }}>🔄</span> Scenario Analysis
              </h3>
              <p className="text-secondary" style={{ flexGrow: 1, marginBottom: 'var(--space-5)' }}>
                {role === 'ROLE_PHARMA_SHOP_OWNER' 
                  ? '🔒 Upgrade to Company Owner to evaluate the impact of supply and demand shocks.'
                  : 'Evaluate the impact of supply and demand shocks on your business operations.'}
              </p>
              {role === 'ROLE_PHARMA_COMPANY_OWNER' && (
                <button className="btn btn-secondary" onClick={() => navigate('/forecast')} style={{ width: '100%' }}>
                  Open Scenario Workspace
                </button>
              )}
            </div>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--psi-secondary)' }}>
              <h3 className="card-title text-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span> Decision Intelligence
              </h3>
              <p className="text-secondary" style={{ flexGrow: 1 }}>
                Understand actionable insights and recommended business actions derived from AI models.
              </p>
            </div>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--psi-secondary)' }}>
              <h3 className="card-title text-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '1.5rem' }}>🏭</span> Operational Intelligence
              </h3>
              <p className="text-secondary" style={{ flexGrow: 1 }}>
                Monitor real-time operational demand signals and detect supply-chain anomalies.
              </p>
            </div>
          </div>
        </section>
      )}

      {role === 'ROLE_ADMIN' && (
        <section data-testid="admin-placeholder" className="mb-8">
          <h2 className="text-primary mb-4" style={{ fontSize: '1.5rem' }}>Administration Workspace</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--psi-danger)' }}>
              <h3 className="card-title text-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '1.5rem' }}>🛡️</span> Business Verification
              </h3>
              <p className="text-secondary mb-5">Review and manage pending pharmacy business registration requests.</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin/verifications')} data-testid="open-verification-btn" style={{ width: '100%' }}>
                Open Verification Workspace
              </button>
            </div>
          </div>
        </section>
      )}

      {(!role || role === 'ROLE_CUSTOMER') && (
        <section data-testid="customer-placeholder" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px' }}>
          {verificationStatus === 'PENDING_VERIFICATION' && (
            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '1.25rem' }}>⏳</span>
              <div>
                <strong style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Verification: Pending</strong>
                <span style={{ fontSize: '0.95rem' }}>Your business-owner application is awaiting administrator verification. Additional business intelligence capabilities will unlock upon approval.</span>
              </div>
            </div>
          )}
          
          <div className="card">
            <h3 className="card-title text-primary">About PSI</h3>
            <p className="text-secondary mb-4">
              Pharma Sales Intelligence (PSI) is an AI-powered pharmaceutical sales intelligence platform. 
              We use advanced machine learning models, including LightGBM and SARIMA, to provide demand forecasting, scenario analysis, and operational intelligence.
            </p>
            <h4 className="text-primary mb-2">How Forecasting Works</h4>
            <p className="text-secondary mb-6">
              Our forecasting engine analyzes historical sales data across various pharmaceutical categories to predict future demand. We factor in seasonal trends, historical sales volume, and external signals to generate highly accurate predictions.
            </p>
            
            <div className="alert alert-info" style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '1.25rem' }}>🔒</span>
              <div>
                <strong style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Protected Business Intelligence</strong>
                <span style={{ fontSize: '0.9rem' }}>Business intelligence features (Demand Forecasting, Scenario Analysis) are strictly reserved for verified Pharma Shop Owners and Company Owners.</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {role !== 'ROLE_ADMIN' && (
        <section className="mt-8 pt-8" style={{ borderTop: '1px solid var(--psi-border)' }}>
          <MedicineCatalog />
        </section>
      )}
    </div>
  );
};

export default Dashboard;
