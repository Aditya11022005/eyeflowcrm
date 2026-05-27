import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import PatientDetailsPage from './pages/PatientDetailsPage.jsx';
import CheckupPage from './pages/CheckupPage.jsx';
import PrescriptionDetailsPage from './pages/PrescriptionDetailsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import BillingPage from './pages/BillingPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage.jsx';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected SaaS App routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
        <Route path="/checkups" element={<CheckupPage />} />
        <Route path="/prescriptions/:id" element={<PrescriptionDetailsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Superadmin Panel */}
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
