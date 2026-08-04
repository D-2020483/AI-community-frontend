import React from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";

export function HeaderNavbar({ title, onMenuToggle }) {
  return (
    <header className="h-16 px-4 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
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
            Citizen workspace
          </span>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Notifications */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-slate-200/80 transition-all hover:shadow-sm cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded-xl transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100">
            C
          </div>
          <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
