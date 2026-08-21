import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-xs font-semibold text-slate-400">Checking session…</p>
      </div>
    </div>
  );
}

export function RoleGuard({ roles, children }) {
  const { role, isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  const mustChangePassword =
    user &&
    !user.isPasswordSet &&
    (role === "authority" || role === "officer");

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}

export default RoleGuard;
