import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthoritySidebar } from "@/layouts/authority/AuthoritySidebar";
import { AuthorityHeader } from "@/layouts/authority/AuthorityHeader";
import { useAuth } from "@/context/AuthContext";

export function AuthorityLayout({ title, subtitle, children }) {
  const { isAuthenticated, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated || role !== "authority") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <AuthoritySidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AuthorityHeader
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
