import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForecastDashboard from './pages/ForecastDashboard';
import AdminVerification from './pages/AdminVerification';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlaceholder from './pages/AdminPlaceholder';
import AdminUsers from './pages/AdminUsers';
import AdminProductCatalog from './pages/AdminProductCatalog';
import AdminSettings from './pages/AdminSettings';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ScenarioAnalysis from './pages/ScenarioAnalysis';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/forecast"
        element={
          <ProtectedRoute
            allowedRoles={[
              'ROLE_CUSTOMER',
              'ROLE_PHARMA_SHOP_OWNER',
              'ROLE_PHARMA_COMPANY_OWNER',
              'ROLE_ADMIN'
            ]}
          >
            <Layout>
              <ForecastDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scenario-analysis"
        element={
          <ProtectedRoute allowedRoles={['ROLE_PHARMA_COMPANY_OWNER', 'ROLE_ADMIN']}>
            <Layout>
              <ScenarioAnalysis />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/verifications"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout>
              <AdminVerification />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout>
              <AdminProductCatalog />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
