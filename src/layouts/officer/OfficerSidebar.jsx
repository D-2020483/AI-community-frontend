import React from "react";
import {
  LayoutGrid,
  ClipboardList,
  RefreshCw,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const navSections = [
  {
    label: "Officer Workspace",
    items: [
{ name: "Dashboard", icon: LayoutGrid, path: "/officer/overview" },
      {
        name: "Assigned tasks",
        icon: ClipboardList,
        path: "/officer/tasks",
        badge: true,
      },
      {
        name: "Task updates",
        icon: RefreshCw,
        path: "/officer/updates",
      },
    ],
  },
];

export function OfficerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const officerName = user?.fullName || "Officer";

  const isActive = (path) => {
    if (path === "/officer/overview") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
              className="lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Officer Role Chip */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20">
            <UserRound className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold leading-tight">
                {officerName}
              </p>
              <p className="text-[9px] text-white/80 truncate">
                {user?.officer?.department || user?.officer?.authority?.name || "Field Operations"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 mt-4 pb-4 max-h-[calc(100vh-240px)] overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <div className="px-3 pb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.label}
                </span>
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        if (onClose) onClose();
                      }}
                      className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        active
                          ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            active
                              ? "text-indigo-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Account Block */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100">
              {officerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {officerName}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.email || ""}
              </span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleLogout}
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
