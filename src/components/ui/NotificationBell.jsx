import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotificationBell({ to, unreadCount = 0 }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
      className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-slate-200/80 transition-all hover:shadow-sm cursor-pointer"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
      )}
    </button>
  );
}
