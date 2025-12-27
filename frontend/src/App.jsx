import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './components/ThemeProvider.jsx';
import { PrivateRoute } from './components/PrivateRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';

// Public Pages
import { HomePage } from './pages/HomePage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { ServicesPage } from './pages/ServicesPage.jsx';
import { SoftwareDevelopmentPage } from './pages/SoftwareDevelopmentPage.jsx';
import { ProfessionalServicesPage } from './pages/ProfessionalServicesPage.jsx';
import { DBAPage } from './pages/DBAPage.jsx';
import { QAPage } from './pages/QAPage.jsx';
import { BusinessIntelligencePage } from './pages/BusinessIntelligencePage.jsx';
import { DataSciencePage } from './pages/DataSciencePage.jsx';
import { CRMPage } from './pages/CRMPage.jsx';
import { CloudServicesPage } from './pages/CloudServicesPage.jsx';
import { DevOpsPage } from './pages/DevOpsPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { CareersPage } from './pages/CareersPage.jsx';

// Auth Pages
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { RoleSelectionPage } from './pages/RoleSelectionPage.jsx';
import { RoleLoginPage } from './pages/RoleLoginPage.jsx';

// Admin Portal
import AdminLayout from './pages/admin/AdminLayout.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { ClientManagement } from './pages/admin/ClientManagement.jsx';
import { AdminReports } from './pages/admin/AdminReports.jsx';
import ClientLogoManagement from './pages/admin/ClientLogoManagement.jsx';
import { JobManagement } from './pages/admin/JobManagement.jsx';
import { AdminUserManagement } from './pages/admin/AdminUserManagement.jsx';

// User Portal
import UserLayout from './pages/user/UserLayout.jsx';
import { UserDashboard } from './pages/user/UserDashboard.jsx';
import { LogHours } from './pages/user/LogHours.jsx';
import { HoursHistory } from './pages/user/HoursHistory.jsx';

// Employee Portal
import { EmployeeTimeCards } from './pages/employee/EmployeeTimeCards.jsx';

// Employer Portal
import { EmployerDashboard } from './pages/employer/EmployerDashboard.jsx';

function App() {
  return (
    <>
      <ThemeProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/software-development" element={<SoftwareDevelopmentPage />} />
            <Route path="/services/professional" element={<ProfessionalServicesPage />} />
            <Route path="/services/dba" element={<DBAPage />} />
            <Route path="/services/qa" element={<QAPage />} />
            <Route path="/services/business-intelligence" element={<BusinessIntelligencePage />} />
            <Route path="/services/data-science" element={<DataSciencePage />} />
            <Route path="/services/crm" element={<CRMPage />} />
            <Route path="/services/cloud-services" element={<CloudServicesPage />} />
            <Route path="/services/devops" element={<DevOpsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/careers" element={<CareersPage />} />
          </Route>

          {/* Auth Routes - Role Selection and Login */}
          <Route path="/login" element={<RoleSelectionPage />} />
          <Route path="/login/:role" element={<RoleLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Portal */}
          <Route
            element={
              <PrivateRoute requiredRole="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/clients" element={<ClientManagement />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/client-logos" element={<ClientLogoManagement />} />
            <Route path="/admin/jobs" element={<JobManagement />} />
          </Route>

          {/* Employer Portal */}
          <Route
            path="/employer/dashboard"
            element={
              <PrivateRoute requiredRole="employer">
                <EmployerDashboard />
              </PrivateRoute>
            }
          />

          {/* Employee Portal */}
          <Route
            path="/employee/timecards"
            element={
              <PrivateRoute requiredRole="employee">
                <EmployeeTimeCards />
              </PrivateRoute>
            }
          />

          {/* User Portal */}
          <Route
            element={
              <PrivateRoute requiredRole="user">
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/log-hours" element={<LogHours />} />
            <Route path="/user/history" element={<HoursHistory />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
