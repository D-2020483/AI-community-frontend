import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  AUTH_EXPIRED_EVENT,
  apiRequest,
  clearAuthStorage,
  getRefreshToken,
  getToken,
  setAuthSession,
  setStoredUser,
} from "@/lib/api";
import { getRouteForRole, mapBackendRole } from "@/lib/auth";

const ROLE_STORAGE_KEY = "civiclink_role";
const LOGIN_ROLES = ["citizen", "authority", "officer", "admin"];

function getInviteSearchParams() {
  if (typeof window === "undefined") {
    return { invite: "", role: "" };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    invite: params.get("invite") || "",
    role: params.get("role") || "",
  };
}

function getInitialRole() {
  try {
    const { invite, role } = getInviteSearchParams();
    if (invite && LOGIN_ROLES.includes(role)) {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
      return role;
    }
    return localStorage.getItem(ROLE_STORAGE_KEY) || "citizen";
  } catch {
    return "citizen";
  }
}

const AuthContext = createContext({
  role: "citizen",
  user: null,
  setRole: () => {},
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  changePassword: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [role, setRoleState] = useState(getInitialRole);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSetRole = useCallback((nextRole) => {
    setRoleState(nextRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const applySession = useCallback(
    (profile, session) => {
      const mappedRole = mapBackendRole(profile.role);
      setAuthSession(session);
      setStoredUser(profile);
      setUser(profile);
      handleSetRole(mappedRole);
      setIsAuthenticated(true);
      return mappedRole;
    },
    [handleSetRole],
  );

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const { invite, role: roleFromLink } = getInviteSearchParams();

      // Invitation links must always land on login for that role, even if an
      // admin (or any other user) is already signed in on this browser.
      if (invite) {
        const existingToken = getToken();
        if (existingToken) {
          try {
            await apiRequest("/auth/logout", { method: "POST" });
          } catch {
            /* ignore logout errors so the invite form still opens */
          }
        }
        clearAuthStorage();
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
          if (LOGIN_ROLES.includes(roleFromLink)) {
            handleSetRole(roleFromLink);
          }
          setIsLoading(false);
        }
        return;
      }

      const token = getToken();
      const refreshToken = getRefreshToken();
      if (!token && !refreshToken) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        if (!cancelled) {
          applySession(data.data.user, {
            access_token: getToken(),
            refresh_token: getRefreshToken(),
            expires_at: undefined,
          });
        }
      } catch {
        if (!cancelled) {
          clearAuthStorage();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [applySession, handleSetRole]);

  const login = useCallback(
    async (email, password, { expectedRole, inviteToken } = {}) => {
        const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          expectedRole: expectedRole || role,
          inviteToken: inviteToken || undefined,
        }),
      });

      const { user: profile, session, requiresPasswordChange } = data.data;
      if (!session?.access_token) {
        throw new Error(
          "Sign-in succeeded but no session was returned. Check your email verification status.",
        );
      }

      const mappedRole = applySession(profile, session);
      const route = requiresPasswordChange
        ? "/change-password"
        : getRouteForRole(mappedRole);

      return {
        user: profile,
        role: mappedRole,
        route,
        requiresPasswordChange: Boolean(requiresPasswordChange),
      };
    },
    [applySession, role],
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword, confirmPassword }) => {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      setUser((prev) =>
        prev ? { ...prev, isPasswordSet: true, invitationStatus: "ACCEPTED" } : prev,
      );
    },
    [],
  );

  const updateProfile = useCallback(async (payload) => {
    const data = await apiRequest("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const nextUser = data.data?.user;
    if (nextUser) {
      setStoredUser(nextUser);
      setUser(nextUser);
    }
    return nextUser;
  }, []);

  const logout = useCallback(async ({ resetRole = true } = {}) => {
    try {
      const token = getToken();
      if (token) {
        await apiRequest("/auth/logout", { method: "POST" });
      }
    } catch {
      /* clear local session even if logout request fails */
    } finally {
      clearAuthStorage();
      setUser(null);
      setIsAuthenticated(false);
      if (resetRole) {
        handleSetRole("citizen");
      }
    }
  }, [handleSetRole]);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      handleSetRole("citizen");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [handleSetRole]);

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        setRole: handleSetRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
