import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getOfficerTasks,
  mapComplaintToOfficerTask,
  updateOfficerTask,
} from "@/lib/reportService";

const STORAGE_KEY = "civiclink_officer";

const OfficerContext = createContext({
  officer: null,
  loginOfficer: () => {},
  logoutOfficer: () => {},
  tasks: [],
  tasksLoading: false,
  tasksError: null,
  refreshTasks: async () => {},
  acceptTask: async () => {},
  updateTaskStatus: async () => {},
  addTaskUpdate: async () => {},
});

function sessionFromUser(user) {
  return {
    name: user?.fullName || "Field Officer",
    email: user?.email || "",
    role: "officer",
    department:
      user?.officer?.department ||
      user?.officer?.authority?.name ||
      user?.officer?.position ||
      "",
    position: user?.officer?.position || "Field Officer",
    authorityName: user?.officer?.authority?.name || "",
  };
}

export function OfficerProvider({ children }) {
  const { user, role, isAuthenticated, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  const officer = useMemo(() => {
    if (!isAuthenticated || role !== "officer" || !user) return null;
    const session = sessionFromUser(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore storage errors */
    }
    return session;
  }, [isAuthenticated, role, user]);

  const loadTasks = useCallback(async () => {
    if (!officer) {
      setTasks([]);
      setTasksError(null);
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);
    setTasksError(null);

    try {
      const assigned = await getOfficerTasks();
      setTasks(assigned);
    } catch (error) {
      setTasks([]);
      setTasksError(
        error?.message || "Could not load tasks assigned to this officer.",
      );
    } finally {
      setTasksLoading(false);
    }
  }, [officer]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const loginOfficer = () => ({
    success: false,
    message: "Use the main login page to sign in as an officer.",
  });

  const logoutOfficer = async () => {
    setTasks([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
    await logout();
  };

  const persistTask = async (taskId, payload) => {
    try {
      const updated = await updateOfficerTask(taskId, payload);
      setTasks((prev) => {
        const exists = prev.some((task) => task.id === taskId || task.reportId === taskId);
        if (!exists) return prev;
        return prev.map((task) =>
          task.id === taskId || task.reportId === taskId
            ? mapComplaintToOfficerTask({ ...task, ...updated })
            : task,
        );
      });
      return updated;
    } catch (error) {
      await loadTasks();
      throw error;
    }
  };

  const acceptTask = async (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "Accepted" } : task,
      ),
    );
    return persistTask(taskId, { status: "Accepted" });
  };

  const updateTaskStatus = async (taskId, status) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );
    return persistTask(taskId, { status });
  };

  const addTaskUpdate = async (taskId, update) => {
    return persistTask(taskId, { note: update });
  };

  const value = {
    officer,
    loginOfficer,
    logoutOfficer,
    tasks,
    tasksLoading,
    tasksError,
    refreshTasks: loadTasks,
    acceptTask,
    updateTaskStatus,
    addTaskUpdate,
  };

  return (
    <OfficerContext.Provider value={value}>{children}</OfficerContext.Provider>
  );
}

export const useOfficer = () => useContext(OfficerContext);
