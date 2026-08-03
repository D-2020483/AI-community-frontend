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
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
