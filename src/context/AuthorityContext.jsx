import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { authorityOfficers } from "@/data/authority/mockOfficers";
import { findAuthorityByEmail } from "@/data/authority/mockAuthorities";
import {
  getAssignedReports,
  getAuthorityOfficers,
  mapComplaintToAuthorityView,
  updateAssignedReport,
} from "@/lib/reportService";

const STORAGE_KEY = "civiclink_authority";

const AuthorityContext = createContext({
  authority: null,
  reports: [],
  reportsLoading: false,
  reportsError: null,
  refreshReports: async () => {},
  officers: [],
  assignOfficer: () => {},
  updateReportStatus: () => {},
  resolveReport: () => {},
  addOfficer: () => {},
  updateOfficer: () => {},
});

function sessionFromUser(user) {
  const record = user?.authority;
  const mock = findAuthorityByEmail(user?.email || "") || {};
  return {
    authorityName: record?.name || user?.fullName || "Authority",
    authorityType: record?.coverage || record?.district || mock.type || "",
    email: user?.email || "",
    shortCode: mock.shortCode || "",
    color: mock.color || "from-emerald-600 to-teal-600",
    categories: mock.categories || [],
    phone: record?.phone || user?.phone || "",
    address: record?.address || "",
  };
}

export function AuthorityProvider({ children }) {
  const { user, role, isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);
  const [officers, setOfficers] = useState([]);

  const authority = useMemo(() => {
    if (!isAuthenticated || role !== "authority" || !user) return null;
    const session = sessionFromUser(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore storage errors */
    }
    return session;
  }, [isAuthenticated, role, user]);

  const loadReports = useCallback(async () => {
    if (!authority) {
      setReports([]);
      setReportsError(null);
      setReportsLoading(false);
      return;
    }

    setReportsLoading(true);
    setReportsError(null);

    try {
      const [assigned, staff] = await Promise.all([
        getAssignedReports(),
        getAuthorityOfficers().catch(() => []),
      ]);
      setReports(assigned);
      setOfficers(
        staff.length
          ? staff
          : authorityOfficers.filter(
              (officer) =>
                officer.authority === authority.authorityName ||
                authority.authorityName
                  ?.toLowerCase()
                  .includes(String(officer.authority || "").toLowerCase()),
            ),
      );
    } catch (error) {
      setReports([]);
      setReportsError(
        error?.message || "Could not load reports assigned to this authority.",
      );
    } finally {
      setReportsLoading(false);
    }
  }, [authority]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const persistResolution = async (reportId, payload) => {
    try {
      const updated = await updateAssignedReport(reportId, payload);
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? mapComplaintToAuthorityView({ ...report, ...updated })
            : report,
        ),
      );
      return updated;
    } catch (error) {
      await loadReports();
      throw error;
    }
  };

  const assignOfficer = async (reportId, officerName) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, assignedOfficer: officerName, status: "Assigned" }
          : report,
      ),
    );
    return persistResolution(reportId, {
      assignedOfficer: officerName,
      status: "Assigned",
    });
  };

  const updateReportStatus = async (reportId, status, assignedOfficer) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status,
              assignedOfficer:
                assignedOfficer === undefined
                  ? report.assignedOfficer
                  : assignedOfficer,
            }
          : report,
      ),
    );
    return persistResolution(reportId, { status, assignedOfficer });
  };

  const resolveReport = (reportId) => {
    updateReportStatus(reportId, "Resolved");
  };

  const addOfficer = (officer) => {
    setOfficers((prev) => [officer, ...prev]);
  };

  const updateOfficer = (officer) => {
    setOfficers((prev) =>
      prev.map((item) =>
        item.id === officer.id ? { ...item, ...officer } : item,
      ),
    );
  };

  const value = {
    authority,
    reports,
    reportsLoading,
    reportsError,
    refreshReports: loadReports,
    allReports: reports,
    officers,
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
