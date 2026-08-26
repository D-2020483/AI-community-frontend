import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { AuthorityLayout } from "@/layouts/authority/AuthorityLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/authority/FilterBar";
import { ReportTable } from "@/components/authority/ReportTable";
import { useAuthority } from "@/context/AuthorityContext";
import { markReportsSeen, REPORT_SEEN_KEYS } from "@/lib/reportBadges";
import {
  matchesCategoryFilter,
  useIssueCategories,
} from "@/lib/categoryService";

export default function AuthorityReports() {
  const navigate = useNavigate();
  const { reports, reportsLoading, reportsError, refreshReports } =
    useAuthority();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [priority, setPriority] = useState("All Priority");
  const [status, setStatus] = useState("All Status");
  const [location, setLocation] = useState("All Locations");
  const [sort, setSort] = useState("newest");
  const { options: categoryOptions, loading: categoriesLoading } =
    useIssueCategories();

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  useEffect(() => {
    if (!reports.length) return;
    markReportsSeen(
      reports.map((report) => report.id),
      REPORT_SEEN_KEYS.authority,
    );
  }, [reports]);

  const categories = useMemo(
    () => ["All Categories", ...categoryOptions.map((option) => option.label)],
    [categoryOptions],
  );
  const locations = useMemo(
    () => [
      "All Locations",
      ...Array.from(
        new Set(
          reports
            .map((r) => (r.location || "").split(",")[0].trim())
            .filter(Boolean),
        ),
      ),
    ],
    [reports],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reports.filter((r) => {
      const matchQuery =
        !q ||
        r.title?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q);
      const matchCategory = matchesCategoryFilter(
        r.category,
        category,
        categoryOptions,
      );
      const matchPriority =
        priority === "All Priority" || r.priority === priority;
      const matchStatus = status === "All Status" || r.status === status;
      const matchLocation =
        location === "All Locations" ||
        r.location.toLowerCase().includes(location.toLowerCase());
      return (
        matchQuery &&
        matchCategory &&
        matchPriority &&
        matchStatus &&
        matchLocation
      );
    });

    // Sort — newest / oldest by date, or priority.
    if (sort === "newest") {
      list = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
    } else if (sort === "oldest") {
      list = [...list].sort((a, b) => (a.date > b.date ? 1 : -1));
    } else if (sort === "priority-high") {
      const order = { High: 0, Medium: 1, Low: 2 };
      list = [...list].sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sort === "priority-low") {
      const order = { High: 0, Medium: 1, Low: 2 };
      list = [...list].sort((a, b) => order[b.priority] - order[a.priority]);
    }
    return list;
  }, [reports, query, category, priority, status, location, sort, categoryOptions]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All Categories");
    setPriority("All Priority");
    setStatus("All Status");
    setLocation("All Locations");
    setSort("newest");
  };

  return (
    <AuthorityLayout
      title="Reports"
      subtitle="All reports assigned to your authority"
    >
      <PageHeader
        title="Reports"
        subtitle={
          reportsLoading
            ? "Loading reports assigned to your authority"
            : `${reports.length} reports assigned to your authority`
        }
      />

      {reportsError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
          <span>{reportsError}</span>
          <button
            type="button"
            onClick={refreshReports}
            className="text-xs font-semibold text-rose-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {reportsLoading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-5 py-10 text-center text-sm text-slate-500">
          Loading assigned reports…
        </div>
      )}

      {!reportsLoading && (
        <>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search by ID, title, category or location..."
        filters={[
          {
            key: "category",
            label: "Category",
            value: category,
            onChange: setCategory,
            options: categories,
            disabled: categoriesLoading,
          },
          {
            key: "priority",
            label: "Priority",
            value: priority,
            onChange: setPriority,
            options: ["All Priority", "High", "Medium", "Low"],
          },
          {
            key: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              "All Status",
              "Pending",
              "Assigned",
              "In Progress",
              "Resolved",
            ],
          },
          {
            key: "location",
            label: "Location",
            value: location,
            onChange: setLocation,
            options: locations,
          },
        ]}
        sortOptions={[
          { value: "newest", label: "Newest first" },
          { value: "oldest", label: "Oldest first" },
          { value: "priority-high", label: "Priority: High → Low" },
          { value: "priority-low", label: "Priority: Low → High" },
        ]}
        sortValue={sort}
        onSortChange={setSort}
        onReset={resetFilters}
      />

      <ReportTable
        reports={filtered}
        onView={(report) => navigate(`/authority/reports/${report.id}`)}
      />

      {filtered.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">
            No reports found
          </p>
        </div>
      )}
        </>
      )}
    </AuthorityLayout>
  );
}
