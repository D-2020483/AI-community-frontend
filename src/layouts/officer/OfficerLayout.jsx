import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { OfficerSidebar } from "@/layouts/officer/OfficerSidebar";
import { OfficerHeader } from "@/layouts/officer/OfficerHeader";
import { useOfficer } from "@/context/OfficerContext";

export function OfficerLayout({ title, subtitle, children }) {
  const { officer } = useOfficer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

if (!officer) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <OfficerSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <OfficerHeader
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
