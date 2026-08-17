import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../api/apiClient';

const AdminProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authenticatedFetch('/api/admin/products', { method: 'GET' });
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    setError('');
    setSuccessMsg('');
    if (product) {
      setEditingProduct(product);
      setCategoryCode(product.categoryCode || '');
      setCategoryName(product.categoryName || '');
      setDescription(product.description || '');
      setActive(product.active !== false);
    } else {
      setEditingProduct(null);
      setCategoryCode('');
      setCategoryName('');
      setDescription('');
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    const payload = {
      categoryCode,
      categoryName,
      description,
      active
    };

    try {
      if (editingProduct) {
        await authenticatedFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Product updated successfully.');
      } else {
        await authenticatedFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Product created successfully.');
      }
      handleCloseModal();
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product category?')) return;
    
    setError('');
    setSuccessMsg('');
    try {
      await authenticatedFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setSuccessMsg('Product deleted successfully.');
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  const toggleStatus = async (product) => {
    try {
      await authenticatedFetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...product, active: !product.active })
      });
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  return (
    <div>
      <section className="mb-6" style={{ borderBottom: '1px solid var(--psi-border)', paddingBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-primary mb-2" style={{ fontSize: '1.75rem' }}>Product Catalog</h1>
          <p className="text-secondary" style={{ margin: 0 }}>Manage pharmaceutical product categories.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={loading}>
          + Add Product
        </button>
      </section>

      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>{successMsg}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p className="text-secondary" style={{ margin: 0 }}>Loading products...</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--psi-border)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--space-3)' }}>Category Code</th>
                <th style={{ padding: 'var(--space-3)' }}>Name</th>
                <th style={{ padding: 'var(--space-3)' }}>Description</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'center' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--psi-text-muted)' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                (products || []).map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--psi-border)', opacity: p.active ? 1 : 0.6 }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 'bold' }}>{p.categoryCode}</td>
                    <td style={{ padding: 'var(--space-3)' }}>{p.categoryName}</td>
                    <td style={{ padding: 'var(--space-3)' }}>{p.description || '-'}</td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                      <button 
                        onClick={() => toggleStatus(p)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: 'var(--space-1) var(--space-2)',
                          backgroundColor: p.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                          color: p.active ? 'rgb(21, 128, 61)' : 'rgb(71, 85, 105)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        {p.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: '0.85rem' }}
                          onClick={() => handleOpenModal(p)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: '0.85rem' }}
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', position: 'relative' }}>
            <h2 className="text-primary mb-4" style={{ marginTop: 0 }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Category Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={categoryCode} 
                  onChange={(e) => setCategoryCode(e.target.value)} 
                  required 
                  placeholder="e.g. M01AB"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  required 
                  placeholder="e.g. Anti-inflammatory"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input 
                  type="checkbox" 
                  id="activeCheck" 
                  checked={active} 
                  onChange={(e) => setActive(e.target.checked)} 
                  style={{ width: 'auto' }}
                />
                <label htmlFor="activeCheck" style={{ margin: 0 }}>Active</label>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductCatalog;
