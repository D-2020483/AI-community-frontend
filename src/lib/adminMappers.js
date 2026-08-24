export function mapAuthorityFromApi(authority) {
  return {
    id: authority.id,
    name: authority.name,
    email: authority.profile?.email || "",
    phone: authority.phone || "—",
    address: authority.address || "—",
    coverage: authority.coverage || "All Metro Districts",
    district: authority.district?.trim() || "—",
    description: authority.description || "",
    officers: authority.officerCount ?? authority.officers?.length ?? 0,
    activeReports: authority.activeReports ?? 0,
    resolvedReports: authority.resolvedReports ?? 0,
    populationCovered: 0,
    areaSize: "—",
    operatingHours: "Mon–Fri, 8:00 AM – 5:00 PM",
    head: {
      name: authority.profile?.fullName || "TBD",
      position: "Head of Authority",
    },
    status: authority.status,
    invitationStatus: authority.profile?.invitationStatus,
  };
}

export function mapOfficerFromApi(officer) {
  const parts = (officer.profile?.fullName || " ").trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  return {
    id: officer.id,
    firstName,
    lastName,
    email: officer.profile?.email || "",
    phone: officer.profile?.phone || "—",
    position: officer.position || "Officer",
    department: officer.department || "Field Operations",
    authority: officer.authority?.name || "—",
    authorityId: officer.authorityId,
    activeReports: 0,
    completedReports: 0,
    availability: "Available",
    status: officer.status,
    invitationStatus: officer.profile?.invitationStatus,
  };
}

export function mapAuthorityOption(authority) {
  return {
    id: authority.id,
    name: authority.name,
  };
}

export function mapCategoryFromApi(category) {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon || "Tag",
    color: category.color || "#4f46e5",
    status: category.status || "Active",
    reports: category.reports ?? 0,
    code: category.code || category.name,
  };
}

export function mapAdminReportFromApi(report) {
  if (!report) return null;
  return {
    id: report.id,
    dbId: report.dbId,
    title: report.title || report.detectedIssue || report.category,
    image: report.image || report.imageUrl || "",
    category: report.category || "—",
    citizen: report.citizen || "Unknown citizen",
    citizenEmail: report.citizenEmail || "—",
    authority: report.authority || report.assignedAuthority || "—",
    officer: report.officer || "—",
    priority: report.priority || "Medium",
    status: report.status || "Pending",
    created: report.created || "—",
    updated: report.updated || "—",
    district: report.district || "—",
    location: report.location || "—",
    lat: report.lat,
    lng: report.lng,
    aiCategory: report.aiCategory || report.category || "—",
    confidence: report.confidence ?? 0,
    description: report.description || "",
    reason: report.reason || "",
  };
}

export function mapCitizenFromApi(user) {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.fullName || "Citizen",
    email: user.email || "",
    phone: user.phone || "—",
    district: user.district || "—",
    location: user.location || user.district || "—",
    joined: user.joined || "—",
    createdAt: user.createdAt,
    reports: user.reports ?? user.totalReports ?? 0,
    status: user.status || "Active",
    totalReports: user.totalReports ?? user.reports ?? 0,
    resolvedReports: user.resolvedReports ?? 0,
    pendingReports: user.pendingReports ?? 0,
    inProgressReports: user.inProgressReports ?? 0,
    recentActivity: user.recentActivity || [],
  };
}
