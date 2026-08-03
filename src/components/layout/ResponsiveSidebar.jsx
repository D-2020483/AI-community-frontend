import React from "react";
import {
  LayoutGrid,
  Plus,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  Activity,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { name: "Overview", icon: LayoutGrid, path: "/dashboard" },
  { name: "Report issue", icon: Plus, path: "/report-issue" },
  { name: "My reports", icon: FileText, path: "/reports" },
  { name: "Track report", icon: Activity, path: "/track-report/RPT-1042" },
  { name: "Notifications", icon: Bell, path: "/notifications", badge: 3 },
  { name: "Profile", icon: User, path: "/profile" },
];

export function ResponsiveSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white">
      <div>
        {/* Top Header Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-1.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Civic <span className="text-indigo-600">Link</span>
            </span>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Section Label */}
        <div className="px-6 pt-6 pb-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Citizen Workspace
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  if (onClose) onClose();
                }}
                className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Account Block */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">
                Citizen User
              </span>
              <span className="text-[10px] text-slate-400">
                Account settings
              </span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-900 transition-colors pt-2 px-1 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 min-h-screen border-r border-slate-100 shrink-0 select-none sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl transition-transform z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
