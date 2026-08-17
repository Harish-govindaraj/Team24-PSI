import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../api/apiClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authenticatedFetch('/api/admin/users', { method: 'GET' });
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (actionLoadingId) return;
    setActionLoadingId(id);
    setError('');
    setSuccessMsg('');
    try {
      await authenticatedFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      setSuccessMsg('User deleted successfully.');
      setDeleteConfirmId(null);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const formatRole = (role) => {
    switch(role) {
      case 'ROLE_CUSTOMER': return 'Customer';
      case 'ROLE_PHARMA_SHOP_OWNER': return 'Shop Owner';
      case 'ROLE_PHARMA_COMPANY_OWNER': return 'Company Owner';
      case 'ROLE_ADMIN': return 'Administrator';
      default: return role;
    }
  };

  return (
    <div>
      <section className="mb-6" style={{ borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-4)' }}>
        <h1 className="text-primary mb-2" style={{ fontSize: '1.75rem' }}>User Management</h1>
        <p className="text-secondary" style={{ margin: 0 }}>View and manage all registered users.</p>
      </section>

      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>{successMsg}</div>}

      <div className="card mb-6" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="ROLE_CUSTOMER">Customer</option>
            <option value="ROLE_PHARMA_SHOP_OWNER">Shop Owner</option>
            <option value="ROLE_PHARMA_COMPANY_OWNER">Company Owner</option>
            <option value="ROLE_ADMIN">Administrator</option>
          </select>
        </div>
        <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>Refresh</button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p className="text-secondary" style={{ margin: 0 }}>Loading users...</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--psi-border)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--space-3)' }}>ID</th>
                <th style={{ padding: 'var(--space-3)' }}>Name</th>
                <th style={{ padding: 'var(--space-3)' }}>Email</th>
                <th style={{ padding: 'var(--space-3)' }}>Role</th>
                <th style={{ padding: 'var(--space-3)' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--psi-text-muted)' }}>
                    No users found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--psi-border)' }}>
                    <td style={{ padding: 'var(--space-3)' }}>{u.id}</td>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 'bold' }}>{u.fullName}</td>
                    <td style={{ padding: 'var(--space-3)' }}>{u.email}</td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <span style={{ 
                        padding: 'var(--space-1) var(--space-2)', 
                        backgroundColor: 'var(--psi-background)', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.85rem' 
                      }}>
                        {formatRole(u.role)}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>{u.verificationStatus || 'N/A'}</td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                      {deleteConfirmId === u.id ? (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: 'var(--space-1) var(--space-2)', fontSize: '0.85rem' }}
                            onClick={() => handleDelete(u.id)}
                            disabled={actionLoadingId !== null}
                          >
                            {actionLoadingId === u.id ? '...' : 'Confirm'}
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: 'var(--space-1) var(--space-2)', fontSize: '0.85rem' }}
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={actionLoadingId !== null}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: '0.85rem' }}
                          onClick={() => setDeleteConfirmId(u.id)}
                          disabled={actionLoadingId !== null || u.role === 'ROLE_ADMIN'}
                          title={u.role === 'ROLE_ADMIN' ? 'Cannot delete administrators' : ''}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
