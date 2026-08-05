import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RoleGuard } from "@/app/guards/RoleGuard";

// Auth Pages
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));

// Citizen Pages
const CitizenDashboard = lazy(() => import("@/pages/citizen/CitizenDashboard"));
const ReportIssue = lazy(() => import("@/pages/report/ReportIssue"));
const TrackReport = lazy(() => import("@/pages/report/TrackReport"));
const ReportsPage = lazy(() => import("@/pages/report/ReportsListPage"));
const NotificationsPage = lazy(() =>
  import("@/pages/notifications/NotificationsPage"),
);
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AuthorityManagement = lazy(() =>
  import("@/pages/admin/AuthorityManagement"),
);
const AuthorityDetails = lazy(() => import("@/pages/admin/AuthorityDetails"));
const OfficerManagement = lazy(() => import("@/pages/admin/OfficerManagement"));
const CategoriesManagement = lazy(() =>
  import("@/pages/admin/CategoriesManagement"),
);
const ReportsManagement = lazy(() => import("@/pages/admin/ReportsManagement"));
const AnalyticsDashboard = lazy(() =>
  import("@/pages/admin/AnalyticsDashboard"),
);
const AdminNotifications = lazy(() =>
  import("@/pages/admin/AdminNotifications"),
);
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));

// Authority Pages
const AuthorityDashboard = lazy(() =>
  import("@/pages/authority/AuthorityDashboard"),
);
const AuthorityReports = lazy(() =>
  import("@/pages/authority/AuthorityReports"),
);
const AuthorityReportDetails = lazy(() =>
  import("@/pages/authority/AuthorityReportDetails"),
);
const AuthorityOfficers = lazy(() =>
  import("@/pages/authority/AuthorityOfficers"),
);
const AuthorityAnalytics = lazy(() =>
  import("@/pages/authority/AuthorityAnalytics"),
);

// Officer Pages
const OfficerDashboard = lazy(() => import("@/pages/officer/OfficerDashboard"));
const OfficerTaskDetails = lazy(() =>
  import("@/pages/officer/OfficerTaskDetails"),
);
const OfficerAssignedTasks = lazy(() =>
  import("@/pages/officer/OfficerAssignedTasks"),
);
const OfficerTaskUpdates = lazy(() =>
  import("@/pages/officer/OfficerTaskUpdates"),
);

// Fallback shown while lazy chunks load.
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-xs font-semibold text-slate-400">Loading…</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen Routes (role: citizen) */}
        <Route
          path="/dashboard"
          element={
            <RoleGuard roles={["citizen"]}>
              <CitizenDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/report-issue"
          element={
            <RoleGuard roles={["citizen"]}>
              <ReportIssue />
            </RoleGuard>
          }
        />
        <Route
          path="/track-report/:reportId"
          element={
            <RoleGuard roles={["citizen"]}>
              <TrackReport />
            </RoleGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleGuard roles={["citizen"]}>
              <ReportsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/notifications"
          element={
            <RoleGuard roles={["citizen"]}>
              <NotificationsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <RoleGuard roles={["citizen"]}>
              <ProfilePage />
            </RoleGuard>
          }
        />

        {/* Admin Routes (role: admin) */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleGuard roles={["admin"]}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleGuard roles={["admin"]}>
              <UserManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/authorities"
          element={
            <RoleGuard roles={["admin"]}>
              <AuthorityManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/authorities/:authorityId"
          element={
            <RoleGuard roles={["admin"]}>
              <AuthorityDetails />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/officers"
          element={
            <RoleGuard roles={["admin"]}>
              <OfficerManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RoleGuard roles={["admin"]}>
              <CategoriesManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleGuard roles={["admin"]}>
              <ReportsManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RoleGuard roles={["admin"]}>
              <AnalyticsDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RoleGuard roles={["admin"]}>
              <AdminNotifications />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RoleGuard roles={["admin"]}>
              <SettingsPage />
            </RoleGuard>
          }
        />

        {/* Authority Routes (role: authority, guarded by AuthorityLayout redirect too) */}
        <Route
          path="/authority/login"
          element={<Navigate to="/login" replace />}
        />
        <Route
          path="/authority/dashboard"
          element={
            <RoleGuard roles={["authority"]}>
              <AuthorityDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/authority/reports"
          element={
            <RoleGuard roles={["authority"]}>
              <AuthorityReports />
            </RoleGuard>
          }
        />
        <Route
          path="/authority/reports/:id"
          element={
            <RoleGuard roles={["authority"]}>
              <AuthorityReportDetails />
            </RoleGuard>
          }
        />
        <Route
          path="/authority/officers"
          element={
            <RoleGuard roles={["authority"]}>
              <AuthorityOfficers />
            </RoleGuard>
          }
        />
        <Route
          path="/authority/analytics"
          element={
            <RoleGuard roles={["authority"]}>
              <AuthorityAnalytics />
            </RoleGuard>
          }
        />

{/* Officer Routes (role: officer) */}
        <Route
          path="/officer/login"
          element={<Navigate to="/login" replace />}
        />
        <Route
          path="/officer/overview"
          element={
            <RoleGuard roles={["officer"]}>
              <OfficerDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/officer/tasks"
          element={
            <RoleGuard roles={["officer"]}>
              <OfficerAssignedTasks />
            </RoleGuard>
          }
        />
        <Route
          path="/officer/tasks/:id"
          element={
            <RoleGuard roles={["officer"]}>
              <OfficerTaskDetails />
            </RoleGuard>
          }
        />
        <Route
          path="/officer/updates"
          element={
            <RoleGuard roles={["officer"]}>
              <OfficerTaskUpdates />
            </RoleGuard>
          }
        />
      </Routes>
    </Suspense>
  );
}
