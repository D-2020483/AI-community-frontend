import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, ChevronDown, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/ui/NotificationBell";

export function AuthorityHeader({ title, subtitle, onMenuToggle, unreadCount = 0 }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authorityName = user?.authority?.name || user?.fullName || "Authority";
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const quickLinks = [
    { label: "Dashboard", to: "/authority/dashboard" },
    { label: "Reports", to: "/authority/reports" },
    { label: "Officers", to: "/authority/officers" },
    { label: "Analytics", to: "/authority/analytics" },
    { label: "Notifications", to: "/authority/notifications" },
    { label: "Settings", to: "/authority/settings" },
  ];

  const filtered = query.trim()
    ? quickLinks.filter((q) =>
        q.label.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <header className="h-16 px-4 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Icon */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <span className="text-[11px] font-medium text-slate-400 block -mb-0.5">
            Authority workspace
          </span>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Global Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Quick search..."
              className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 focus:bg-white transition-all"
            />
          </div>

          {searchOpen && filtered.length > 0 && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-30">
              {filtered.map((q) => (
                <button
                  key={q.to}
                  onClick={() => {
                    navigate(q.to);
                    setSearchOpen(false);
                    setQuery("");
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationBell
          to="/authority/notifications"
          unreadCount={unreadCount}
        />

        {/* Authority Badge */}
        <div
          onClick={() => navigate("/authority/settings")}
          className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <div
            className={`h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100`}
          >
            <Building2 className="h-4 w-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {authorityName}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {user?.email || "Authority account"}
            </p>
          </div>
          <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
