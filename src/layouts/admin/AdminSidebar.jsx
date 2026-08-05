import React from "react";
import {
  LayoutGrid,
  Users,
  Building2,
  ShieldCheck,
  Tag,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ROLE = "admin";

const navSections = [
  {
    label: "Administrator Workspace",
    items: [
      { name: "Dashboard", icon: LayoutGrid, path: "/admin/dashboard" },
      { name: "User Management", icon: Users, path: "/admin/users" },
      {
        name: "Authority Management",
        icon: Building2,
        path: "/admin/authorities",
      },
      {
        name: "Officer Management",
        icon: ShieldCheck,
        path: "/admin/officers",
      },
      { name: "Categories", icon: Tag, path: "/admin/categories" },
      { name: "Reports", icon: FileText, path: "/admin/reports", badge: 12 },
      { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Notifications",
        icon: Bell,
        path: "/admin/notifications",
        badge: 5,
      },
      { name: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
];

export function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
const { setRole } = useAuth();

  const isActive = (path) => {
    if (path === "/admin/dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setRole(ROLE);
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

        {/* Admin Role Chip */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold leading-tight">
                Administrator
              </p>
              <p className="text-[9px] text-indigo-200 truncate">
                Super Admin · Full Access
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
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
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
              SA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                Super Admin
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                admin@civiclink.gov
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/settings")}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
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
