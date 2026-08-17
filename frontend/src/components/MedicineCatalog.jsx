import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../api/apiClient';

const MedicineCatalog = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await authenticatedFetch('/api/products/categories', { method: 'GET' });
        setCategories(data || []);
      } catch (err) {
        setError(err.message || 'Unable to load medicine information');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p className="text-secondary" style={{ margin: 0 }}>Loading medicine categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p className="text-secondary" style={{ margin: 0 }}>No medicine categories available</p>
      </div>
    );
  }

  return (
    <div className="medicine-catalog">
      <h3 className="text-primary mb-4" style={{ fontSize: '1.25rem' }}>Medicine Categories</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {categories.map((cat) => (
          <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-4)', opacity: cat.active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>{cat.categoryCode}</span>
              <span className={`badge ${cat.active ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                {cat.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h4 className="text-primary" style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.1rem' }}>{cat.categoryName}</h4>
            <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0, flexGrow: 1 }}>
              {cat.description || 'No description available.'}
            </p>
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--psi-border)', fontSize: '0.85rem' }}>
              <span className="text-primary" style={{ fontWeight: 500 }}>Forecast Availability: </span>
              <span className="text-secondary">{cat.active ? 'Available' : 'Limited'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicineCatalog;
