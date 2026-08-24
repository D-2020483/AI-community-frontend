const API_BASE =
  import.meta.env.VITE_API_URL || "https://civic-link-backend.onrender.com/api";

export const TOKEN_KEY = "civiclink_token";
export const REFRESH_TOKEN_KEY = "civiclink_refresh_token";
export const TOKEN_EXPIRES_AT_KEY = "civiclink_token_expires_at";
export const USER_KEY = "civiclink_user";
export const AUTH_EXPIRED_EVENT = "civiclink:auth-expired";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token) {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function getTokenExpiresAt() {
  try {
    const raw = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function setTokenExpiresAt(expiresAt) {
  try {
    if (expiresAt) {
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
    } else {
      localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function setAuthSession(session) {
  if (!session) {
    setToken(null);
    setRefreshToken(null);
    setTokenExpiresAt(null);
    return;
  }

  if (typeof session === "string") {
    setToken(session);
    return;
  }

  if (session.access_token) {
    setToken(session.access_token);
  }
  if (session.refresh_token) {
    setRefreshToken(session.refresh_token);
  }

  const expiresAt = Number(
    session.expires_at ||
      (session.expires_in
        ? Math.floor(Date.now() / 1000) + Number(session.expires_in)
        : 0),
  );
  if (expiresAt) {
    setTokenExpiresAt(expiresAt);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function clearAuthStorage() {
  setToken(null);
  setRefreshToken(null);
  setTokenExpiresAt(null);
  setStoredUser(null);
}

export function getErrorMessage(data, fallback = "Request failed") {
  if (data?.errors?.[0]?.message) return data.errors[0].message;
  if (data?.message) return data.message;
  return fallback;
}

function isPublicAuthPath(path) {
  return (
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/logout") ||
    path.startsWith("/auth/accept-invite") ||
    path.startsWith("/auth/invite") ||
    path.startsWith("/auth/login-invite")
  );
}

function isAccessTokenExpiringSoon() {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt || Number.isNaN(expiresAt)) return false;
  return Date.now() / 1000 >= expiresAt - 60;
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.data?.session?.access_token) {
        return null;
      }

      setAuthSession(data.data.session);
      return data.data.session.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function expireLocalSession() {
  if (!getToken() && !getRefreshToken()) return;
  clearAuthStorage();
  try {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  } catch {
    /* ignore */
  }
}

export async function apiRequest(path, options = {}, retry = true) {
  if (!isPublicAuthPath(path) && getRefreshToken() && isAccessTokenExpiringSoon()) {
    await refreshAccessToken();
  }

  const token = getToken();
  const headers = { ...options.headers };
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401 && retry && !isPublicAuthPath(path)) {
    const currentToken = getToken();
    if (currentToken && token && currentToken !== token) {
      return apiRequest(path, options, false);
    }

    if (getRefreshToken()) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        return apiRequest(path, options, false);
      }
    }

    if (token || getToken() || getRefreshToken()) {
      expireLocalSession();
    }
  }

  if (!response.ok) {
    const error = new Error(getErrorMessage(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
