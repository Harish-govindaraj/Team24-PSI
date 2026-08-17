import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../api/apiClient';

const AdminVerification = () => {
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmRejectId, setConfirmRejectId] = useState(null);

  const fetchPendingVerifications = async (clearSuccess = true) => {
    setLoading(true);
    setError('');
    if (clearSuccess) {
      setSuccessMsg('');
    }
    try {
      const data = await authenticatedFetch('/api/admin/verifications/pending', { method: 'GET' });
      setPendingApplications(data || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const handleApprove = async (id, applicantName) => {
    if (actionLoadingId) return;
    setActionLoadingId(id);
    setError('');
    setSuccessMsg('');
    try {
      await authenticatedFetch(`/api/admin/verifications/${id}/approve`, { method: 'POST' });
      setSuccessMsg(`Application approved successfully for ${applicantName}.`);
      await fetchPendingVerifications(false);
    } catch (err) {
      setError(err.message || 'Failed to approve application.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const initiateReject = (id) => {
    if (actionLoadingId) return;
    setConfirmRejectId(id);
  };

  const handleConfirmReject = async (id, applicantName) => {
    if (actionLoadingId) return;
    setActionLoadingId(id);
    setError('');
    setSuccessMsg('');
    setConfirmRejectId(null);
    try {
      await authenticatedFetch(`/api/admin/verifications/${id}/reject`, { method: 'POST' });
      setSuccessMsg(`Application rejected successfully for ${applicantName}.`);
      await fetchPendingVerifications(false);
    } catch (err) {
      setError(err.message || 'Failed to reject application.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const cancelReject = () => {
    setConfirmRejectId(null);
  };

  const formatRole = (role) => {
    if (role === 'PHARMA_SHOP_OWNER') return 'Pharmacy Shop Owner';
    if (role === 'PHARMA_COMPANY_OWNER') return 'Pharmacy Company Owner';
    return role;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      <section className="mb-6" style={{ borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-4)' }}>
        <h1 className="text-primary mb-2" style={{ fontSize: '1.75rem' }}>Business Owner Verification</h1>
        <p className="text-secondary" style={{ margin: 0 }}>Review and manage pending pharmacy business registration requests.</p>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="text-primary" style={{ margin: 0, fontSize: '1.25rem' }}>Pending Applications</h3>
          <button 
            className="btn btn-secondary" 
            onClick={() => fetchPendingVerifications(true)}
            disabled={loading || actionLoadingId !== null}
            data-testid="refresh-btn"
          >
            Refresh Data
          </button>
        </div>

        {error && <div className="alert alert-danger" data-testid="error-message">{error}</div>}
        {successMsg && <div className="alert alert-success" data-testid="success-message">{successMsg}</div>}

        {loading ? (
          <div className="card" data-testid="loading-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p className="text-secondary" style={{ margin: 0 }}>Loading verification applications...</p>
          </div>
        ) : pendingApplications.length === 0 ? (
          <div className="card" data-testid="empty-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <h3 className="text-primary mb-2">No pending verification applications</h3>
            <p className="text-secondary" style={{ margin: 0 }}>New business-owner registrations will appear here when they require review.</p>
          </div>
        ) : (
          <div className="applications-list" data-testid="applications-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {(pendingApplications || []).map((app) => (
              <div key={app.id} className="card" data-testid={`application-card-${app.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-4)' }}>
                  <div>
                    <span className="form-label">Applicant</span>
                    <div className="text-primary" data-testid={`applicant-name-${app.id}`} style={{ fontWeight: 500 }}>{app.fullName}</div>
                  </div>
                  <div>
                    <span className="form-label">Email</span>
                    <div className="text-secondary">{app.email}</div>
                  </div>
                  <div>
                    <span className="form-label">Phone</span>
                    <div className="text-secondary">{app.phoneNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="form-label">Business Name</span>
                    <div className="text-primary" style={{ fontWeight: 500 }}>{app.businessName}</div>
                  </div>
                  <div>
                    <span className="form-label">Registration ID</span>
                    <div className="text-secondary">{app.businessRegistrationId}</div>
                  </div>
                  <div>
                    <span className="form-label">Requested Role</span>
                    <div className="badge badge-info" data-testid={`requested-role-${app.id}`}>{formatRole(app.requestedRole)}</div>
                  </div>
                  <div>
                    <span className="form-label">Status</span>
                    <div className="badge badge-warning">Pending</div>
                  </div>
                  <div>
                    <span className="form-label">Date Submitted</span>
                    <div className="text-secondary">{formatDate(app.createdAt)}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {confirmRejectId === app.id ? (
                    <div className="alert alert-danger" data-testid={`confirm-reject-dialog-${app.id}`} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', margin: 0, padding: 'var(--space-3)', width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>Are you sure you want to reject this application? This action cannot be undone.</span>
                      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={cancelReject}
                          disabled={actionLoadingId === app.id}
                          data-testid={`cancel-reject-btn-${app.id}`}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleConfirmReject(app.id, app.fullName)}
                          disabled={actionLoadingId === app.id}
                          data-testid={`confirm-reject-btn-${app.id}`}
                        >
                          {actionLoadingId === app.id ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="btn btn-danger"
                        onClick={() => initiateReject(app.id)}
                        disabled={actionLoadingId !== null}
                        data-testid={`reject-btn-${app.id}`}
                        aria-label={`Reject application for ${app.fullName}`}
                      >
                        Reject
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleApprove(app.id, app.fullName)}
                        disabled={actionLoadingId !== null}
                        data-testid={`approve-btn-${app.id}`}
                        aria-label={`Approve application for ${app.fullName}`}
                      >
                        {actionLoadingId === app.id ? 'Approving...' : 'Approve Application'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminVerification;
