import React, { useState } from "react";
import toast from "react-hot-toast";
import { ResponsiveSidebar } from "@/layouts/citizen/ResponsiveSidebar";
import { HeaderNavbar } from "@/layouts/citizen/HeaderNavbar";
import { TellUs } from "@/pages/report/TellUs";
import { SetLocation } from "@/pages/report/SetLocation";
import { AIAnalysisResult } from "@/pages/report/AIAnalysisResult";
import { useNavigate } from "react-router-dom";

export default function ReportIssue() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  // Handler passed to SetLocation to trigger submission view
  const handleSubmit = () => {
    setIsSubmitted(true);
    toast.success(
      "Report submitted successfully! AI is analyzing your issue…",
      {
        id: "report-submitted",
      },
    );
  };

  // Handler to navigate to the track report page after reviewing AI results
  const handleTrackReport = (reportDetails) => {
    toast("Opening the live tracker for your report…");
    navigate("/track-report/RPT-1042", {
      state: {
        report: {
          id: "RPT-1042",
          title: "Road surface damage detected",
          description:
            "Large pothole on the eastbound lane. It is causing drivers to move into the opposite lane.",
          location: "22 Oak Street, North District",
          category: reportDetails?.category || "Roads & Infrastructure",
          confidence: "92%",
          authority: reportDetails?.authority || "Public Works Dept.",
          priority: "High",
          status: "Assigned",
          date: "24 Jul 2026",
          imageUrl:
            "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      {/* Sidebar Navigation */}
      <ResponsiveSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Bar - Header updates based on view state */}
        <HeaderNavbar
          title={isSubmitted ? "AI analysis result" : "Report an issue"}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Content View Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {!isSubmitted ? (
            <>
              {/* Main Title Section */}
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Report an issue
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Help us identify and resolve problems in your neighborhood.
                </p>
              </div>

              {/* Grid Layout: Stacked on mobile, 2 Equal Height Columns on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="animate-slide-up h-full flex flex-col">
                  <TellUs />
                </div>
                <div
                  className="animate-slide-up h-full flex flex-col"
                  style={{ animationDelay: "100ms" }}
                >
                  <SetLocation onSubmit={handleSubmit} />
                </div>
              </div>
            </>
          ) : (
            /* AI Analysis Screen View */
            <AIAnalysisResult onTrackReport={handleTrackReport} />
          )}
        </main>
      </div>
    </div>
  );
}
