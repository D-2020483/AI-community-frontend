import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { OfficerSidebar } from "@/layouts/officer/OfficerSidebar";
import { OfficerHeader } from "@/layouts/officer/OfficerHeader";
import { useAuth } from "@/context/AuthContext";
import { useWorkspaceInbox } from "@/hooks/useWorkspaceInbox";
import {
  getOfficerNotifications,
  getOfficerTasks,
} from "@/lib/reportService";
import { REPORT_SEEN_KEYS } from "@/lib/reportBadges";

export function OfficerLayout({ title, subtitle, children }) {
  const { isAuthenticated, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inbox = useWorkspaceInbox({
    role: "officer",
    fetchItems: getOfficerTasks,
    fetchNotifications: getOfficerNotifications,
    itemsPath: "/officer/tasks",
    notificationsPath: "/officer/notifications",
    seenKey: REPORT_SEEN_KEYS.officer,
  });

  if (!isAuthenticated || role !== "officer") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <OfficerSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        notificationBadge={inbox.notificationBadge}
        unseenTasks={inbox.unseenItems}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <OfficerHeader
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setMobileMenuOpen(true)}
          unreadCount={inbox.unreadCount}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
