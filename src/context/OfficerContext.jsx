import React, { createContext, useContext, useState } from "react";
import {
  officerTasks,
  mockOfficerCredential,
} from "@/data/officer/mockOfficerTasks";

const STORAGE_KEY = "civiclink_officer";

const OfficerContext = createContext({
  officer: null,
  loginOfficer: () => {},
  logoutOfficer: () => {},
  tasks: [],
  acceptTask: () => {},
  updateTaskStatus: () => {},
  addTaskUpdate: () => {},
});

export function OfficerProvider({ children }) {
  // Initialize officer from localStorage (simulated session).
  const [officer, setOfficer] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });

  const [tasks, setTasks] = useState(officerTasks);

  const loginOfficer = (email, password) => {
    if (
      email.trim().toLowerCase() !== mockOfficerCredential.email ||
      password !== mockOfficerCredential.password
    ) {
      return { success: false, message: "Invalid email or password." };
    }
    const session = {
      name: mockOfficerCredential.name,
      email: mockOfficerCredential.email,
      role: mockOfficerCredential.role,
      department: mockOfficerCredential.department,
    };
    setOfficer(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { success: true, officer: session };
  };

  const logoutOfficer = () => {
    setOfficer(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Accept a task (marks status as "Accepted").
  const acceptTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "Accepted" } : t)),
    );
  };

  // Update a task's status directly.
  const updateTaskStatus = (taskId, status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
    );
  };

  // Append a resolution update to a task.
  const addTaskUpdate = (taskId, update) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              updates: [
                ...(t.updates || []),
                {
                  id: `upd-${Date.now()}`,
                  author: officer?.name || "Field Officer",
                  text: update,
                  time: new Date().toLocaleString(),
                },
              ],
            }
          : t,
      ),
    );
  };

  const value = {
    officer,
    loginOfficer,
    logoutOfficer,
    tasks,
    acceptTask,
    updateTaskStatus,
    addTaskUpdate,
  };

  return (
    <OfficerContext.Provider value={value}>{children}</OfficerContext.Provider>
  );
}

export const useOfficer = () => useContext(OfficerContext);
