import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--psi-background)' }}>
      {/* 1. Enterprise Navigation */}
      <header style={{ 
        padding: 'var(--space-4) var(--space-6)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: 'var(--psi-surface)', 
        borderBottom: '1px solid var(--psi-border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Brand Left */}
        <h1 style={{ margin: 0, color: 'var(--psi-primary)', fontSize: '1.75rem', letterSpacing: '-0.025em' }}>PSI</h1>
        
        {/* Navigation & Actions Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <nav style={{ display: 'flex', gap: '28px' }} className="hide-on-mobile">
            <a href="#solutions" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Solutions</a>
            <a href="#ai-engine" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none', fontWeight: 500 }}>AI Intelligence</a>
            <a href="#how-it-works" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none', fontWeight: 500 }}>How It Works</a>
          </nav>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link to="/login" className="btn btn-secondary" data-testid="login-link">Login</Link>
            <Link to="/register" className="btn btn-primary" data-testid="register-link">Get Started</Link>
          </div>
        </div>
      </header>

      <main style={{ flexGrow: 1 }}>
        {/* 2. Hero Section */}
        <section className="section-alt" style={{ padding: 'var(--space-12) var(--space-6)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: 'var(--space-8)', alignItems: 'center' }}>
            <div>
              <h2 className="text-primary mb-4" style={{ fontSize: '3.5rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                AI-Powered Intelligence for Pharmaceutical Demand
              </h2>
              <p className="text-secondary mb-6" style={{ fontSize: '1.25rem', maxWidth: '600px' }}>
                Forecast demand, understand operational risk, and turn pharmaceutical sales data into actionable business intelligence.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Link to="/register" className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-6)', fontSize: '1.1rem' }}>
                  Get Started
                </Link>
                <a href="#solutions" className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-6)', fontSize: '1.1rem' }}>
                  Explore Intelligence
                </a>
              </div>
            </div>
            <div className="hero-visual hide-on-mobile" style={{ height: 'auto' }}>
              <div className="mock-header">
                <div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div>
                <div style={{ marginLeft: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--psi-text-muted)', fontWeight: 500 }}>Product Preview</div>
              </div>
              <div className="mock-body" style={{ flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Header metrics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--psi-primary)' }}>PSI Forecast Intelligence</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--psi-text-secondary)' }}>M01AB Pharmaceutical Demand</div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-6)', textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--psi-text-muted)', fontWeight: 600 }}>Demand Forecast</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--psi-primary)' }}>5.37m units</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--psi-text-muted)', fontWeight: 600 }}>Confidence</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--psi-success)' }}>87.5%</div>
                    </div>
                  </div>
                </div>

                {/* SVG Chart */}
                <div style={{ position: 'relative', height: '220px', width: '100%', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--psi-border)', padding: 'var(--space-3)' }}>
                  <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                    {/* Grid lines */}
                    <path d="M0,30 L500,30 M0,75 L500,75 M0,120 L500,120" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" fill="none" />
                    
                    {/* Historical Data (Solid) */}
                    <path d="M0,100 C50,80 100,110 150,60 C200,10 250,90 300,50" stroke="#94a3b8" strokeWidth="3" fill="none" />
                    
                    {/* Confidence Band */}
                    <path d="M300,50 C350,20 400,60 500,30 L500,100 C400,120 350,70 300,50 Z" fill="rgba(14, 165, 233, 0.1)" stroke="none" />
                    
                    {/* Forecast Data (Dashed/Distinct) */}
                    <path d="M300,50 C350,30 400,80 500,60" stroke="var(--psi-primary)" strokeWidth="3" strokeDasharray="6,4" fill="none" />
                    
                    {/* Split Line */}
                    <line x1="300" y1="0" x2="300" y2="150" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                    
                    {/* Labels */}
                    <text x="10" y="20" fill="#64748b" fontSize="12" fontWeight="500">Historical Sales</text>
                    <text x="310" y="20" fill="var(--psi-primary)" fontSize="12" fontWeight="500">AI Forecast</text>
                  </svg>
                </div>

                {/* Footer insights */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, backgroundColor: 'var(--psi-background)', padding: 'var(--space-3)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--psi-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Model details</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--psi-text-primary)' }}>SARIMA &bull; 7-Day Horizon</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'var(--psi-background)', padding: 'var(--space-3)', borderRadius: '6px', borderLeft: '4px solid var(--psi-info)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--psi-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>AI Insight</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--psi-text-primary)' }}>Stable demand trend detected.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Trust / Value Strip */}
        <section className="trust-strip">
          <div className="trust-item"><span>✨</span> AI-Powered Demand Forecasting</div>
          <div className="trust-item"><span>🔍</span> Explainable Predictions</div>
          <div className="trust-item"><span>🛡️</span> Role-Based Security</div>
          <div className="trust-item"><span>📊</span> Operational Intelligence</div>
        </section>

        {/* 4. Core Intelligence Capabilities */}
        <section id="solutions" className="section">
          <div className="container">
            <h3 className="text-primary" style={{ textAlign: 'center', marginBottom: 'var(--space-2)', fontSize: '2.5rem' }}>One Platform. Multiple Intelligence Layers.</h3>
            <p className="text-secondary mb-6" style={{ textAlign: 'center', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto var(--space-8)' }}>AI-powered pharmaceutical sales intelligence for smarter demand forecasting.</p>
            <div className="capabilities-grid">
              <div className="card">
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>📈</div>
                <h4 className="card-title">Demand Forecasting</h4>
                <p className="text-secondary" style={{ margin: 0 }}>AI-powered pharmaceutical demand prediction leveraging historical sales data and seasonal trends.</p>
              </div>
              <div className="card">
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🔄</div>
                <h4 className="card-title">Scenario Analysis</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Evaluate supply and demand shocks. Test how market disruptions affect your operational resilience.</p>
              </div>
              <div className="card">
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🧠</div>
                <h4 className="card-title">Decision Intelligence</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Turn predictions into actionable recommendations for inventory rebalancing and risk mitigation.</p>
              </div>
              <div className="card">
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🏭</div>
                <h4 className="card-title">Operational Intelligence</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Understand inventory and supply-chain risk with automated anomaly detection across regions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. How PSI Works */}
        <section id="how-it-works" className="section-alt">
          <div className="container">
            <h3 className="text-primary" style={{ textAlign: 'center', marginBottom: 'var(--space-8)', fontSize: '2.5rem' }}>From Data to Decisions</h3>
            <div className="workflow-grid">
              <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none', textAlign: 'center' }}>
                <h4 className="text-primary" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>01</h4>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>📊</div>
                <h5 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>Data</h5>
                <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Ingest historical pharmaceutical sales and operational data.</p>
              </div>
              <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none', textAlign: 'center' }}>
                <h4 className="text-primary" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>02</h4>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🤖</div>
                <h5 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>AI Models</h5>
                <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Run predictions through our advanced Forecasting Models.</p>
              </div>
              <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none', textAlign: 'center' }}>
                <h4 className="text-primary" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>03</h4>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>💡</div>
                <h5 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>Intelligence</h5>
                <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Extract Explainable Insights to understand exactly why predictions occur.</p>
              </div>
              <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none', textAlign: 'center' }}>
                <h4 className="text-primary" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>04</h4>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🎯</div>
                <h5 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>Action</h5>
                <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Make proactive Business Decisions based on concrete data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. AI Engine Section */}
        <section id="ai-engine" className="section">
          <div className="container">
            <h3 className="text-primary" style={{ textAlign: 'center', marginBottom: 'var(--space-8)', fontSize: '2.5rem' }}>Built on an Intelligent Analytics Engine</h3>
            <div className="tech-grid">
              <div className="card" style={{ borderLeft: '4px solid var(--psi-primary)' }}>
                <h4 className="card-title">LightGBM</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Demand prediction and machine learning forecasting.</p>
              </div>
              <div className="card" style={{ borderLeft: '4px solid var(--psi-primary)' }}>
                <h4 className="card-title">SARIMA</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Time-series forecasting for long-term demand trends.</p>
              </div>
              <div className="card" style={{ borderLeft: '4px solid var(--psi-primary)' }}>
                <h4 className="card-title">SHAP</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Explainability for understanding prediction drivers.</p>
              </div>
              <div className="card" style={{ borderLeft: '4px solid var(--psi-secondary)' }}>
                <h4 className="card-title">FastAPI</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Dedicated high-performance AI service layer.</p>
              </div>
              <div className="card" style={{ borderLeft: '4px solid var(--psi-secondary)' }}>
                <h4 className="card-title">Spring Boot</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Secure business logic and API orchestration.</p>
              </div>
              <div className="card" style={{ borderLeft: '4px solid var(--psi-secondary)' }}>
                <h4 className="card-title">React</h4>
                <p className="text-secondary" style={{ margin: 0 }}>Interactive analytics and data visualization experience.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Decision Intelligence Section */}
        <section className="section-alt">
          <div className="container" style={{ textAlign: 'center' }}>
            <h3 className="text-primary" style={{ marginBottom: 'var(--space-4)', fontSize: '2.5rem' }}>Forecast → Understand → Evaluate → Decide</h3>
            <p className="text-secondary" style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto var(--space-6)' }}>
              PSI transforms raw data into a continuous cycle of decision intelligence. From initial forecasting to complex scenario analysis, gain total visibility over your operations.
            </p>
          </div>
        </section>

        {/* 8. Role-Based Experience */}
        <section className="section">
          <div className="container">
            <h3 className="text-primary" style={{ textAlign: 'center', marginBottom: 'var(--space-8)', fontSize: '2.5rem' }}>Built for Every Role in the Pharmaceutical Ecosystem</h3>
            <div className="role-grid">
              <div className="card">
                <span className="badge badge-info mb-2">Customer</span>
                <p className="text-secondary mt-2" style={{ margin: 0 }}>Explore the platform and understand PSI capabilities.</p>
              </div>
              <div className="card">
                <span className="badge badge-success mb-2">Pharma Shop Owner</span>
                <p className="text-secondary mt-2" style={{ margin: 0 }}>Access demand forecasting, operational intelligence and business insights after verification.</p>
              </div>
              <div className="card">
                <span className="badge badge-warning mb-2">Pharma Company Owner</span>
                <p className="text-secondary mt-2" style={{ margin: 0 }}>Access advanced forecasting and Scenario Analysis after verification.</p>
              </div>
              <div className="card">
                <span className="badge badge-danger mb-2">Administrator</span>
                <p className="text-secondary mt-2" style={{ margin: 0 }}>Manage business-owner verification and platform access.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Trusted & Explainable AI */}
        <section className="section-alt">
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)', alignItems: 'center' }}>
            <div className="hero-visual hide-on-mobile" style={{ height: 'auto', backgroundColor: 'var(--psi-surface)', padding: '0', border: '1px solid var(--psi-border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div className="mock-header" style={{ borderBottom: '1px solid var(--psi-border)' }}>
                <div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div>
                <div style={{ marginLeft: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--psi-text-muted)', fontWeight: 500 }}>Illustrative Model Explanation</div>
              </div>
              <div className="mock-body" style={{ flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: '1.1rem', color: 'var(--psi-text-primary)' }}>Feature Contributions</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--psi-text-secondary)' }}>Impact on baseline forecast</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '12px 16px', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-secondary)', textAlign: 'right' }}>Promotion Activity</div>
                  <div style={{ gridColumn: '3', height: '20px', width: '70%', backgroundColor: 'var(--psi-primary)', borderRadius: '0 4px 4px 0' }}></div>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-secondary)', textAlign: 'right' }}>Historical Demand</div>
                  <div style={{ gridColumn: '3', height: '20px', width: '45%', backgroundColor: 'var(--psi-primary)', borderRadius: '0 4px 4px 0' }}></div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-secondary)', textAlign: 'right' }}>Seasonality</div>
                  <div style={{ gridColumn: '3', height: '20px', width: '25%', backgroundColor: 'var(--psi-primary)', borderRadius: '0 4px 4px 0' }}></div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-secondary)', textAlign: 'right' }}>Inventory Level</div>
                  <div style={{ gridColumn: '2', height: '20px', width: '35%', backgroundColor: 'var(--psi-danger)', borderRadius: '4px 0 0 4px', justifySelf: 'end' }}></div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-secondary)', textAlign: 'right' }}>Supplier Delay</div>
                  <div style={{ gridColumn: '2', height: '20px', width: '15%', backgroundColor: 'var(--psi-danger)', borderRadius: '4px 0 0 4px', justifySelf: 'end' }}></div>
                </div>

                <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--psi-background)', borderRadius: '6px', borderLeft: '4px solid var(--psi-info)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--psi-text-primary)' }}>Prediction Confidence: 87.5%</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-primary" style={{ marginBottom: 'var(--space-4)', fontSize: '2.5rem' }}>AI You Can Understand</h3>
              <p className="text-secondary mb-4" style={{ fontSize: '1.1rem' }}>
                We believe that enterprise intelligence must be transparent. PSI provides more than just predictions.
              </p>
              <ul className="text-secondary" style={{ fontSize: '1.1rem', paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li><strong>Forecast Predictions:</strong> Highly accurate baseline demand.</li>
                <li><strong>Confidence Information:</strong> Know exactly how reliable the model is.</li>
                <li><strong>Model Metrics:</strong> View RMSE, MAE, and MAPE scores.</li>
                <li><strong>SHAP Explanations:</strong> Understand which features drove the prediction.</li>
                <li><strong>Operational Risk Indicators:</strong> Early warning systems for your supply chain.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 10. Product Preview */}
        <section className="section">
          <div className="container">
            <h3 className="text-primary" style={{ textAlign: 'center', marginBottom: 'var(--space-6)', fontSize: '2.5rem' }}>Product Showcase</h3>
            <div className="hero-visual" style={{ height: 'auto', backgroundColor: 'var(--psi-surface)', border: '1px solid var(--psi-border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div className="mock-header" style={{ borderBottom: '1px solid var(--psi-border)', backgroundColor: 'var(--psi-background)' }}>
                <div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div>
                <div style={{ marginLeft: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--psi-text-muted)', fontWeight: 500 }}>PSI Forecast Intelligence - Product Preview</div>
              </div>
              <div className="mock-body" style={{ padding: 'var(--space-5)' }}>
                <div style={{ width: '100%' }}>
                  {/* Top KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                    <div style={{ padding: 'var(--space-4)', border: '1px solid var(--psi-border)', borderRadius: '6px', backgroundColor: 'var(--psi-surface)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Demand Forecast</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--psi-primary)', marginTop: 'var(--space-1)' }}>5.37m units</div>
                    </div>
                    <div style={{ padding: 'var(--space-4)', border: '1px solid var(--psi-border)', borderRadius: '6px', backgroundColor: 'var(--psi-surface)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Confidence</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--psi-success)', marginTop: 'var(--space-1)' }}>87.5%</div>
                    </div>
                    <div style={{ padding: 'var(--space-4)', border: '1px solid var(--psi-border)', borderRadius: '6px', backgroundColor: 'var(--psi-surface)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Forecast Horizon</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--psi-primary)', marginTop: 'var(--space-1)' }}>7 days</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div style={{ border: '1px solid var(--psi-border)', borderRadius: '6px', padding: 'var(--space-5)', backgroundColor: '#f8fafc', marginBottom: 'var(--space-5)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <h4 style={{ margin: 0, color: 'var(--psi-text-primary)' }}>Demand Forecast Trend</h4>
                    </div>
                    <div style={{ position: 'relative', height: '240px', width: '100%' }}>
                      <svg viewBox="0 0 800 240" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                        {/* Grid lines */}
                        <path d="M0,48 L800,48 M0,96 L800,96 M0,144 L800,144 M0,192 L800,192" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" fill="none" />
                        
                        {/* Confidence Band */}
                        <path d="M480,96 C560,60 640,120 800,48 L800,192 C640,192 560,144 480,120 Z" fill="rgba(14, 165, 233, 0.08)" stroke="none" />
                        
                        {/* Historical Data (Solid) */}
                        <path d="M0,192 C80,144 160,216 240,120 C320,24 400,168 480,96" stroke="#94a3b8" strokeWidth="3" fill="none" />
                        
                        {/* Forecast Data (Dashed) */}
                        <path d="M480,96 C560,60 640,120 800,96" stroke="var(--psi-primary)" strokeWidth="3" strokeDasharray="6,4" fill="none" />
                        
                        {/* Split Line */}
                        <line x1="480" y1="0" x2="480" y2="240" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                        
                        {/* Legends */}
                        <circle cx="20" cy="220" r="4" fill="#94a3b8" />
                        <text x="32" y="224" fill="#64748b" fontSize="12" fontWeight="500">Historical Demand</text>
                        
                        <circle cx="160" cy="220" r="4" fill="var(--psi-primary)" />
                        <text x="172" y="224" fill="#64748b" fontSize="12" fontWeight="500">Forecast</text>
                        
                        <rect x="250" y="216" width="12" height="8" fill="rgba(14, 165, 233, 0.2)" />
                        <text x="268" y="224" fill="#64748b" fontSize="12" fontWeight="500">Confidence Band</text>
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', backgroundColor: 'var(--psi-background)', padding: 'var(--space-3)', borderRadius: '6px' }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid var(--psi-border)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase' }}>Model: </span>
                      <strong style={{ color: 'var(--psi-text-primary)' }}>SARIMA</strong>
                    </div>
                    <div style={{ textAlign: 'center', borderRight: '1px solid var(--psi-border)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase' }}>Trend: </span>
                      <strong style={{ color: 'var(--psi-text-primary)' }}>Stable</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--psi-text-muted)', textTransform: 'uppercase' }}>Risk: </span>
                      <strong style={{ color: 'var(--psi-success)' }}>Low</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. CTA Section */}
        <section className="section-alt" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
          <div className="container">
            <h2 className="text-primary" style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>Ready to make smarter pharmaceutical decisions?</h2>
            <p className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-6)' }}>Explore PSI's AI-powered intelligence platform.</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-8)', fontSize: '1.1rem' }}>Get Started</Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-8)', fontSize: '1.1rem' }}>Sign In</Link>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Professional Footer */}
      <footer style={{ backgroundColor: 'var(--psi-surface)', borderTop: '1px solid var(--psi-border)', padding: 'var(--space-8) var(--space-6) var(--space-4)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
            <div>
              <h4 className="text-primary" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>PSI<br/><span style={{ fontSize: '0.9rem', color: 'var(--psi-text-secondary)', fontWeight: 400 }}>Pharma Sales Intelligence</span></h4>
            </div>
            <div>
              <h5 className="text-primary" style={{ marginBottom: 'var(--space-3)' }}>Platform</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li><a href="#" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>Demand Forecasting</a></li>
                <li><a href="#" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>Scenario Analysis</a></li>
                <li><a href="#" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>Decision Intelligence</a></li>
                <li><a href="#" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>Operational Intelligence</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-primary" style={{ marginBottom: 'var(--space-3)' }}>Company</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li><a href="#solutions" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>About PSI</a></li>
                <li><a href="#how-it-works" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>How It Works</a></li>
                <li><a href="#ai-engine" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>AI Intelligence</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-primary" style={{ marginBottom: 'var(--space-3)' }}>Account</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li><Link to="/login" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>Login</Link></li>
                <li><Link to="/register" style={{ color: 'var(--psi-text-secondary)', textDecoration: 'none' }}>Register</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--psi-border)' }}>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              &copy; {new Date().getFullYear()} Pharma Sales Intelligence. Built for intelligent pharmaceutical decision-making.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
