const ROLE_ROUTES = {
  citizen: "/dashboard",
  admin: "/admin/dashboard",
  authority: "/authority/dashboard",
  officer: "/officer/overview",
};

export function mapBackendRole(role) {
  if (!role) return "citizen";
  return role.toLowerCase();
}

export function getSessionRole(user, fallbackRole) {
  return mapBackendRole(user?.role || fallbackRole);
}

export function getRouteForRole(role) {
  return ROLE_ROUTES[role] || "/dashboard";
}
