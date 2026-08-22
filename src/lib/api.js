const API_BASE =
  import.meta.env.VITE_API_URL || "https://civic-link-backend.onrender.com/api";

export const TOKEN_KEY = "civiclink_token";
export const USER_KEY = "civiclink_user";

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
  setStoredUser(null);
}

export function getErrorMessage(data, fallback = "Request failed") {
  if (data?.errors?.[0]?.message) return data.errors[0].message;
  if (data?.message) return data.message;
  return fallback;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

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

  if (!response.ok) {
    const error = new Error(getErrorMessage(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
