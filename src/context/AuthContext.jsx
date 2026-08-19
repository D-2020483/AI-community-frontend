import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  apiRequest,
  clearAuthStorage,
  getToken,
  setStoredUser,
  setToken,
} from "@/lib/api";
import { getRouteForRole, mapBackendRole } from "@/lib/auth";

const ROLE_STORAGE_KEY = "civiclink_role";

const AuthContext = createContext({
  role: "citizen",
  user: null,
  setRole: () => {},
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  changePassword: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [role, setRoleState] = useState(() => {
    try {
      return localStorage.getItem(ROLE_STORAGE_KEY) || "citizen";
    } catch {
      return "citizen";
    }
  });
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
    (profile, accessToken) => {
      const mappedRole = mapBackendRole(profile.role);
      setToken(accessToken);
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
      const token = getToken();
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        if (!cancelled) {
          applySession(data.data.user, token);
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
  }, [applySession]);

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

      const mappedRole = applySession(profile, session.access_token);
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

  const logout = useCallback(async () => {
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
      handleSetRole("citizen");
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
