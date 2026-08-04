import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/auth/Login.jsx";
import Register from "@/pages/auth/Register.jsx";
import CitizenDashboard from "@/pages/citizen/CitizenDashboard.jsx";
import ReportIssue from "@/pages/report/ReportIssue.jsx";
import TrackReport from "@/pages/report/TrackReport.jsx";
import ReportsPage from "@/pages/reports/ReportsPage.jsx";
import NotificationsPage from "@/pages/notifications/NotificationsPage.jsx";
import ProfilePage from "@/pages/profile/ProfilePage.jsx";
// Admin Routes
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import UserManagement from "@/pages/admin/UserManagement.jsx";
import AuthorityManagement from "@/pages/admin/AuthorityManagement.jsx";
import AuthorityDetails from "@/pages/admin/AuthorityDetails.jsx";
import OfficerManagement from "@/pages/admin/OfficerManagement.jsx";
import CategoriesManagement from "@/pages/admin/CategoriesManagement.jsx";
import ReportsManagement from "@/pages/admin/ReportsManagement.jsx";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard.jsx";
import AdminNotifications from "@/pages/admin/AdminNotifications.jsx";
import SettingsPage from "@/pages/admin/SettingsPage.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <main>
          <Routes>
            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Routes */}
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/track-report/:reportId" element={<TrackReport />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
<Route path="/profile" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/authorities" element={<AuthorityManagement />} />
            <Route path="/admin/authorities/:authorityId" element={<AuthorityDetails />} />
            <Route path="/admin/officers" element={<OfficerManagement />} />
            <Route path="/admin/categories" element={<CategoriesManagement />} />
            <Route path="/admin/reports" element={<ReportsManagement />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
