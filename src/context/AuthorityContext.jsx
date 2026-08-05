import React, { createContext, useContext, useState, useMemo } from "react";
import { authorityReports } from "@/data/authority/mockReports";
import { authorityOfficers } from "@/data/authority/mockOfficers";
import { findAuthorityByEmail } from "@/data/authority/mockAuthorities";

// Keys used to persist the "logged-in" authority in localStorage.
const STORAGE_KEY = "civiclink_authority";

const AuthorityContext = createContext({
  authority: null,
  loginAuthority: () => {},
  logoutAuthority: () => {},
  reports: [],
  officers: [],
  assignOfficer: () => {},
  updateReportStatus: () => {},
  resolveReport: () => {},
  addOfficer: () => {},
  updateOfficer: () => {},
});

export function AuthorityProvider({ children }) {
  // Initialize authority from localStorage (simulated session).
  const [authority, setAuthority] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });

  // Reports state is module-level mock data repeated per authority.
  const [reports, setReports] = useState(authorityReports);
  const [officers, setOfficers] = useState(authorityOfficers);

  const loginAuthority = (email, password) => {
    const match = findAuthorityByEmail(email);
    if (!match || match.password !== password) {
      return { success: false, message: "Invalid email or password." };
    }
    const session = {
      authorityName: match.name,
      authorityType: match.type,
      email: match.email,
      shortCode: match.shortCode,
      color: match.color,
      categories: match.categories,
    };
    setAuthority(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { success: true, authority: session };
  };

  const logoutAuthority = () => {
    setAuthority(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Reports filtered to the logged-in authority only.
  const filteredReports = useMemo(() => {
    if (!authority) return [];
    return reports.filter((r) => r.authority === authority.authorityName);
  }, [reports, authority]);

  // Officers filtered to the logged-in authority only.
  const filteredOfficers = useMemo(() => {
    if (!authority) return [];
    return officers.filter((o) => o.authority === authority.authorityName);
  }, [officers, authority]);

  const assignOfficer = (reportId, officerName) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, assignedOfficer: officerName, status: "Assigned" }
          : r,
      ),
    );
  };

  const updateReportStatus = (reportId, status) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r)),
    );
  };

  const resolveReport = (reportId) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "Resolved" } : r)),
    );
  };

  const addOfficer = (officer) => {
    setOfficers((prev) => [officer, ...prev]);
  };

  const updateOfficer = (officer) => {
    setOfficers((prev) =>
      prev.map((o) => (o.id === officer.id ? { ...o, ...officer } : o)),
    );
  };

  const value = {
    authority,
    loginAuthority,
    logoutAuthority,
    reports: filteredReports,
    allReports: reports,
    officers: filteredOfficers,
    allOfficers: officers,
    assignOfficer,
    updateReportStatus,
    resolveReport,
    addOfficer,
    updateOfficer,
  };

  return (
    <AuthorityContext.Provider value={value}>
      {children}
    </AuthorityContext.Provider>
  );
}

export const useAuthority = () => useContext(AuthorityContext);
