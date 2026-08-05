import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Route guard that restricts access based on the authenticated role.
 * Allowed roles are passed via the `roles` prop (e.g. ["admin"]).
 */
export function RoleGuard({ roles, children }) {
  const { role } = useAuth();

  if (!roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RoleGuard;
