import React, { createContext, useContext, useState, useCallback } from "react";

// Persist the active role across reloads so the RoleGuard works consistently.
const STORAGE_KEY = "civiclink_role";

const AuthContext = createContext({
  role: "citizen",
  setRole: () => {},
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  // Initialize role from localStorage (simulated session).
  const [role, setRole] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || "citizen";
    } catch (_) {
      return "citizen";
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSetRole = useCallback((nextRole) => {
    setRole(nextRole);
    try {
      localStorage.setItem(STORAGE_KEY, nextRole);
    } catch (_) {}
  }, []);

  const login = useCallback(() => setIsAuthenticated(true), []);
const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole: handleSetRole,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
