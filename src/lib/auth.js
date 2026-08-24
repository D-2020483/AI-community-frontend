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

/** Point an invite/login URL at this app origin so local popups do not open production. */
export function toCurrentOriginUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url, window.location.origin);
    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}
