import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    requestedRole: 'CUSTOMER',
    businessName: '',
    businessRegistrationId: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isBusinessOwner = ['PHARMA_SHOP_OWNER', 'PHARMA_COMPANY_OWNER'].includes(formData.requestedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build payload based on requested role
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        requestedRole: formData.requestedRole
      };
      
      if (isBusinessOwner) {
        payload.phoneNumber = formData.phoneNumber;
        payload.businessName = formData.businessName;
        payload.businessRegistrationId = formData.businessRegistrationId;
      }

      await register(payload);
      setSuccess('Registration successful! You can now log in.');
      setError(null);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
      setSuccess(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--psi-background)', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ margin: 0, color: 'var(--psi-primary)', fontSize: '1.75rem', letterSpacing: '-0.025em' }}>PSI</h1>
          <h2 style={{ margin: 'var(--space-2) 0 0 0', fontSize: '1.25rem', color: 'var(--psi-text-primary)' }}>Register for PSI</h2>
        </div>

        {error && <div className="alert alert-danger" role="alert" data-testid="register-error">{error}</div>}
        {success && <div className="alert alert-success" role="status" data-testid="register-success">{success}</div>}

        <form onSubmit={handleSubmit} data-testid="register-form">
          <div className="form-group">
            <label htmlFor="requestedRole" className="form-label">Role</label>
            <select
              id="requestedRole"
              name="requestedRole"
              className="form-control"
              value={formData.requestedRole}
              onChange={handleChange}
              data-testid="role-select"
            >
              <option value="CUSTOMER">Standard Customer</option>
              <option value="PHARMA_SHOP_OWNER">Pharma Shop Owner</option>
              <option value="PHARMA_COMPANY_OWNER">Pharma Company Owner</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: isBusinessOwner ? 'var(--space-4)' : 'var(--space-6)' }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isBusinessOwner && (
            <div data-testid="business-fields" style={{ backgroundColor: 'var(--psi-background)', padding: 'var(--space-4)', borderRadius: '6px', marginBottom: 'var(--space-6)', border: '1px solid var(--psi-border)' }}>
              <h4 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--psi-primary)', fontSize: '0.95rem' }}>Business Verification Details</h4>
              
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="text"
                  name="phoneNumber"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessName" className="form-label">
                  {formData.requestedRole === 'PHARMA_COMPANY_OWNER' ? 'Company Name' : 'Shop Name'}
                </label>
                <input
                  id="businessName"
                  type="text"
                  name="businessName"
                  className="form-control"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="businessRegistrationId" className="form-label">
                  {formData.requestedRole === 'PHARMA_COMPANY_OWNER' ? 'Company Registration ID' : 'Shop Registration ID'}
                </label>
                <input
                  id="businessRegistrationId"
                  type="text"
                  name="businessRegistrationId"
                  className="form-control"
                  value={formData.businessRegistrationId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: 'var(--space-3)' }}>
            Register
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" data-testid="login-nav-link" style={{ color: 'var(--psi-primary)', fontWeight: 500, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
