import React, { useState, useEffect, useMemo } from "react";
import { Plus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ResponsiveSidebar } from "@/layouts/citizen/ResponsiveSidebar";
import { HeaderNavbar } from "@/layouts/citizen/HeaderNavbar";
import { StatsCards } from "@/components/citizen/StatsCards.jsx";
import { RecentReportsTable } from "@/components/citizen/RecentReportsTable.jsx";
import { CommunityImpactCard } from "@/components/citizen/CommunityImpactCard.jsx";
import { statsData } from "@/data/citizenDashboardData.js";
import { getMyReports } from "@/lib/reportService";
import { useAuth } from "@/context/AuthContext";

function buildCitizenStats(reports) {
  const total = reports.length;
  const pending = reports.filter((r) =>
    ["Pending", "Assigned"].includes(r.status),
  ).length;
  const inProgress = reports.filter((r) => r.status === "In Progress").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  const values = {
    total,
    pending,
    in_progress: inProgress,
    resolved,
  };

  return statsData.map((stat) => ({
    ...stat,
    value: values[stat.id] ?? 0,
  }));
}

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const citizenName = user?.fullName || "Citizen";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    toast.success(`Welcome back, ${citizenName}! You're all caught up.`, {
      id: "citizen-welcome",
    });
  }, [citizenName]);

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      try {
        setLoadingReports(true);
        const mine = await getMyReports();
        if (!cancelled) setReports(mine);
      } catch (error) {
        if (!cancelled) {
          setReports([]);
          toast.error(error?.message || "Failed to load your reports.");
        }
      } finally {
        if (!cancelled) setLoadingReports(false);
      }
    };

    loadReports();
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardStats = useMemo(() => buildCitizenStats(reports), [reports]);

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
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden animate-fade-in">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Citizen Overview
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
                  Welcome back, {citizenName}
                </h2>
                <p className="text-sm text-indigo-100/90 mt-1">
                  Together, we're building a safer, better community.
                </p>
              </div>
              <button
                onClick={handleReportIssue}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 text-xs font-semibold rounded-xl shadow-md shadow-indigo-900/20 hover:bg-indigo-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Report an issue
              </button>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="animate-fade-in">
            <StatsCards stats={dashboardStats} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 animate-slide-up">
              <RecentReportsTable
                reports={reports.slice(0, 5)}
                loading={loadingReports}
              />
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
