export const reportSuggestions = [
  "Accident",
  "Animal",
  "Area",
  "Authority",
  "Asphalt Road Damage",
  "Assault",
  "Asset Damage",
  "Garbage Dumping",
  "Garbage Collection",
  "Garden Waste",
  "Road Damage",
  "Street Light",
  "Water Supply",
  "Pothole",
  "Drainage",
  "Public Safety",
];

export const reportsData = [
  {
    id: "RPT-1042",
    title: "Pothole on Oak Street",
    category: "Roads & Infrastructure",
    date: "24 Jul 2026",
    location: "Oak Street, North District",
    priority: "High",
    status: "Assigned",
    authority: "Public Works Dept.",
  },
  {
    id: "RPT-1041",
    title: "Market Square Drainage",
    category: "Drainage",
    date: "24 Jul 2026",
    location: "Market Square",
    priority: "Medium",
    status: "Pending",
    authority: "Water Authority",
  },
  {
    id: "RPT-1040",
    title: "Street Light Outage",
    category: "Street Lighting",
    date: "23 Jul 2026",
    location: "River Road",
    priority: "Low",
    status: "In Progress",
    authority: "Electrical Dept.",
  },
  {
    id: "RPT-1039",
    title: "Cedar Avenue Road Damage",
    category: "Roads & Infrastructure",
    date: "23 Jul 2026",
    location: "Cedar Avenue",
    priority: "High",
    status: "Resolved",
    authority: "Public Works Dept.",
  },
  {
    id: "RPT-1038",
    title: "Garbage Dumping Near Park",
    category: "Waste Management",
    date: "22 Jul 2026",
    location: "Green Park",
    priority: "Medium",
    status: "Pending",
    authority: "Sanitation Dept.",
  },
  {
    id: "RPT-1037",
    title: "Damaged Street Barrier",
    category: "Roads & Infrastructure",
    date: "22 Jul 2026",
    location: "Highway 12",
    priority: "Low",
    status: "Rejected",
    authority: "Public Works Dept.",
  },
  {
    id: "RPT-1036",
    title: "Water Supply Leak",
    category: "Water Supply",
    date: "21 Jul 2026",
    location: "Maple Street",
    priority: "High",
    status: "In Progress",
    authority: "Water Authority",
  },
  {
    id: "RPT-1035",
    title: "Playground Equipment Damage",
    category: "Public Safety",
    date: "21 Jul 2026",
    location: "Central Park",
    priority: "Medium",
    status: "Resolved",
    authority: "Parks & Recreation",
  },
  {
    id: "RPT-1034",
    title: "Overgrown Trees",
    category: "Garden & Green",
    date: "20 Jul 2026",
    location: "Birch Lane",
    priority: "Low",
    status: "Pending",
    authority: "Parks & Recreation",
  },
  {
    id: "RPT-1033",
    title: "Broken Traffic Signal",
    category: "Traffic",
    date: "20 Jul 2026",
    location: "Main Intersection",
    priority: "High",
    status: "Assigned",
    authority: "Traffic Dept.",
  },
  {
    id: "RPT-1032",
    title: "Illegal Dumping",
    category: "Waste Management",
    date: "19 Jul 2026",
    location: "Industrial Zone",
    priority: "Medium",
    status: "Rejected",
    authority: "Sanitation Dept.",
  },
  {
    id: "RPT-1031",
    title: "Street Light Flickering",
    category: "Street Lighting",
    date: "19 Jul 2026",
    location: "Elm Street",
    priority: "Low",
    status: "Resolved",
    authority: "Electrical Dept.",
  },
];

export const reportCategories = [
  "All Categories",
  "Roads & Infrastructure",
  "Street Lighting",
  "Drainage",
  "Water Supply",
  "Waste Management",
  "Public Safety",
  "Traffic",
  "Garden & Green",
];

export const reportStatuses = [
  "All Status",
  "Pending",
  "In Progress",
  "Resolved",
  "Rejected",
];

export const reportAuthorities = [
  "Public Works Dept.",
  "Water Authority",
  "Electrical Dept.",
  "Sanitation Dept.",
  "Parks & Recreation",
  "Traffic Dept.",
  "City Maintenance",
  "Health & Safety",
];

export const reportPriorities = ["All Priority", "High", "Medium", "Low"];

// Detailed info for each report (description, image, confidence, progress steps)
export const REPORT_DETAILS = {
  "RPT-1042": {
    description:
      "A large pothole has formed on the eastbound lane of Oak Street. It is causing drivers to swerve into the opposite lane, posing a serious safety risk to motorists and cyclists.",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
    confidence: "92%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1041": {
    description:
      "The drainage system at Market Square is blocked, causing water to accumulate and overflow onto the walkway during rain. This is creating an unpleasant and unsafe environment for pedestrians and vendors.",
    imageUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
    confidence: "88%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1040": {
    description:
      "The street light on River Road has been out for several nights, leaving the area dark and increasing the risk of accidents and crime after sunset.",
    imageUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
    confidence: "90%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1039": {
    description:
      "The road surface on Cedar Avenue has deteriorated significantly with multiple cracks and potholes. The damaged section has been repaired and is now safe for travel.",
    imageUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop",
    confidence: "94%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1038": {
    description:
      "Garbage and waste have been dumped illegally near the entrance of Green Park. The debris is attracting pests and creating health concerns for families using the park.",
    imageUrl:
      "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?q=80&w=1000&auto=format&fit=crop",
    confidence: "85%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1037": {
    description:
      "A street barrier on Highway 12 has been damaged and is no longer providing adequate protection. The report was reviewed and rejected as it was assessed as low priority.",
    imageUrl:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=1000&auto=format&fit=crop",
    confidence: "87%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1036": {
    description:
      "A water supply pipe on Maple Street is leaking, causing water loss and potential damage to the road foundation. A field crew has been dispatched to investigate.",
    imageUrl:
      "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?q=80&w=1000&auto=format&fit=crop",
    confidence: "91%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1035": {
    description:
      "Playground equipment at Central Park has been damaged and poses a safety risk to children. The equipment has been repaired and the area is safe again.",
    imageUrl:
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=1000&auto=format&fit=crop",
    confidence: "89%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1034": {
    description:
      "Trees along Birch Lane have become overgrown and are obstructing the footpath and road visibility. The vegetation needs to be trimmed by the parks department.",
    imageUrl:
      "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=1000&auto=format&fit=crop",
    confidence: "86%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1033": {
    description:
      "The traffic signal at Main Intersection is malfunctioning, causing confusion and long delays for commuters. The traffic department has been assigned to resolve the issue.",
    imageUrl:
      "https://images.unsplash.com/photo-1549921296-3b0f9a35af35?q=80&w=1000&auto=format&fit=crop",
    confidence: "93%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1032": {
    description:
      "Illegal dumping has been observed in the Industrial Zone. The report was reviewed and rejected as it could not be verified as a community-owned issue.",
    imageUrl:
      "https://images.unsplash.com/photo-1600259591050-1b0a0b3b0b0b?q=80&w=1000&auto=format&fit=crop",
    confidence: "82%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
  "RPT-1031": {
    description:
      "A street light on Elm Street has been flickering intermittently. The electrical department has resolved the issue and normal lighting has been restored.",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
    confidence: "90%",
    progressSteps: ["Submitted", "Assigned", "In Progress", "Resolved"],
  },
};

// Merge base report fields with detailed info
export function getReportById(id) {
  const base = reportsData.find((r) => r.id === id);
  if (!base) return null;
  const detail = REPORT_DETAILS[id] || {};
  return { ...base, ...detail };
}

export const dateRanges = [
  "All Dates",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];
