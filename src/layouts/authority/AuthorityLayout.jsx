import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthoritySidebar } from "@/layouts/authority/AuthoritySidebar";
import { AuthorityHeader } from "@/layouts/authority/AuthorityHeader";
import { useAuth } from "@/context/AuthContext";
import { getSessionRole } from "@/lib/auth";
import { useWorkspaceInbox } from "@/hooks/useWorkspaceInbox";
import {
  getAssignedReports,
  getWorkspaceNotifications,
} from "@/lib/reportService";
import { REPORT_SEEN_KEYS } from "@/lib/reportBadges";

export function AuthorityLayout({ title, subtitle, children }) {
  const { isAuthenticated, role, user } = useAuth();
  const sessionRole = getSessionRole(user, role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inbox = useWorkspaceInbox({
    role: "authority",
    fetchItems: getAssignedReports,
    fetchNotifications: getWorkspaceNotifications,
    itemsPath: "/authority/reports",
    notificationsPath: "/authority/notifications",
    seenKey: REPORT_SEEN_KEYS.authority,
  });

  if (!isAuthenticated || sessionRole !== "authority") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <AuthoritySidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        notificationBadge={inbox.notificationBadge}
        unseenReports={inbox.unseenItems}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AuthorityHeader
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
