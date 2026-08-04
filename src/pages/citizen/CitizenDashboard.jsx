import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ResponsiveSidebar } from "@/components/layout/ResponsiveSidebar";
import { HeaderNavbar } from "@/components/layout/HeaderNavbar";
import { StatsCards } from "@/pages/citizen/StatsCards.jsx";
import { RecentReportsTable } from "@/pages/citizen/RecentReportsTable.jsx";
import { CommunityImpactCard } from "@/pages/citizen/CommunityImpactCard.jsx";
import { statsData } from "@/data/citizenDashboardData.js";
import { reportsData } from "@/data/reportsData.js";

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    toast.success("Welcome back, Amara! You're all caught up.", {
      id: "citizen-welcome",
    });
  }, []);

  const handleReportIssue = () => {
    toast("Let's get your issue resolved. Start by telling us what happened.");
    navigate("/report-issue");
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <ResponsiveSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNavbar
          title="Dashboard"
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 lg:space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, Amara
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Together, we're building a safer, better community.
              </p>
            </div>

<button
              onClick={handleReportIssue}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.98] cursor-pointer"
            >
              <span>Report an issue</span>
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Top Metric Cards */}
          <div className="animate-fade-in">
            <StatsCards stats={statsData} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 animate-slide-up">
              <RecentReportsTable reports={reportsData.slice(0, 5)} />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <CommunityImpactCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
