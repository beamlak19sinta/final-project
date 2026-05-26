import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Feedback from './pages/Feedback';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import HelpDesk from './pages/HelpDesk';
import './index.css';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

import CitizenLayout from './layouts/CitizenLayout';
import Overview from './pages/citizen/Overview';
import Services from './pages/citizen/Services';
import Queue from './pages/citizen/Queue';
import Appointments from './pages/citizen/Appointments';
import TrackStatus from './pages/citizen/TrackStatus';
import Notifications from './pages/citizen/Notifications';
import Account from './pages/citizen/Account';
import CitizenQuestions from './pages/citizen/Questions';

import OfficerLayout from './layouts/OfficerLayout';
import QueueManagement from './pages/officer/QueueManagement';
import ServiceRequests from './pages/officer/ServiceRequests';
import AppointmentsOfficer from './pages/officer/Appointments';
import History from './pages/officer/History';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import AdminQuestions from './pages/admin/Questions';

import PublicLayout from './layouts/PublicLayout';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/feedback" element={<Feedback />} />
      </Route>

      {/* Citizen Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['CITIZEN']}>
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="services" element={<Services />} />
        <Route path="queue" element={<Queue />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="track" element={<TrackStatus />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="account" element={<Account />} />
        <Route path="questions" element={<CitizenQuestions />} />
      </Route>

      {/* Officer Dashboard Routes */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute roles={['OFFICER', 'HELPDESK', 'HELP_DESK']}>
            <OfficerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/officer/queue" replace />} />
        <Route path="queue" element={<QueueManagement />} />
        <Route path="requests" element={<ServiceRequests />} />
        <Route path="appointments" element={<AppointmentsOfficer />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route
        path="/help-desk"
        element={
          <ProtectedRoute roles={['HELP_DESK', 'HELPDESK', 'OFFICER', 'ADMIN']}>
            <HelpDesk />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="questions" element={<AdminQuestions />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
