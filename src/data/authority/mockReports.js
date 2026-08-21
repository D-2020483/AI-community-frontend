// Mock Reports — dummy report data for the Authority module

const IMG = {
  road: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
  bridge:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop",
  water:
    "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?q=80&w=1000&auto=format&fit=crop",
  garbage:
    "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?q=80&w=1000&auto=format&fit=crop",
  light:
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
  drain:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
  tree: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=1000&auto=format&fit=crop",
  traffic:
    "https://images.unsplash.com/photo-1549921296-3b0f9a35af35?q=80&w=1000&auto=format&fit=crop",
  industry:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop",
};

// Shared timeline builder for a report.
function buildTimeline(id, status, created) {
  const base = [
    {
      label: "Reported",
      text: "Report submitted by citizen",
      time: `${created} · 09:12 AM`,
    },
    {
      label: "Assigned",
      text: "Assigned to authority",
      time: `${created} · 11:40 AM`,
    },
  ];
  if (status === "In Progress") {
    base.push({
      label: "In Progress",
      text: "Field crew dispatched",
      time: `${created} · 02:05 PM`,
    });
  }
  if (status === "Resolved") {
    base.push({
      label: "In Progress",
      text: "Field crew dispatched",
      time: `${created} · 02:05 PM`,
    });
    base.push({
      label: "Resolved",
      text: "Issue resolved & verified",
      time: `${created} · 04:30 PM`,
    });
  }
  return base;
}

const rawReports = [
  //Road Development Authority
  {
    id: "RPT-2001",
    title: "Large pothole on Oak Street",
    category: "Road Damage",
    authority: "Road Development Authority",
    location: "Oak Street, North District",
    priority: "High",
    status: "Pending",
    date: "24 Jul 2026",
    citizen: "Amara Okafor",
    image: IMG.road,
    description:
      "A large pothole has formed on the eastbound lane of Oak Street. Vehicles are swerving to avoid it, creating a serious safety hazard for commuters and cyclists during rush hour.",
    ai: {
      detectedIssue: "Pothole / Road Surface Deterioration",
      category: "Road Damage",
      priority: "High",
      confidence: 92,
    },
    lat: 4.8156,
    lng: 7.0498,
    assignedOfficer: null,
  },
  {
    id: "RPT-2002",
    title: "Cracked bridge railing on River Bridge",
    category: "Bridge Damage",
    authority: "Road Development Authority",
    location: "River Bridge, Central",
    priority: "High",
    status: "In Progress",
    date: "22 Jul 2026",
    citizen: "James Adeleke",
    image: IMG.bridge,
    description:
      "The concrete railing on the western side of River Bridge has cracked and a section has broken away. Pedestrians are at risk and the structural integrity needs urgent inspection.",
    ai: {
      detectedIssue: "Bridge Structural Damage",
      category: "Bridge Damage",
      priority: "High",
      confidence: 88,
    },
    lat: 4.813,
    lng: 7.032,
    assignedOfficer: "Officer 2",
  },
  {
    id: "RPT-2003",
    title: "Road blocked by fallen tree",
    category: "Road Block",
    authority: "Road Development Authority",
    location: "Highway 12, Industrial Zone",
    priority: "Medium",
    status: "Assigned",
    date: "21 Jul 2026",
    citizen: "Ngozi Nwosu",
    image: IMG.tree,
    description:
      "A tree has fallen across both lanes of Highway 12 near the industrial exit, completely blocking traffic. Emergency clearing is required to restore the flow of vehicles.",
    ai: {
      detectedIssue: "Roadway Obstruction",
      category: "Road Block",
      priority: "Medium",
      confidence: 85,
    },
    lat: 4.788,
    lng: 7.06,
    assignedOfficer: "Officer 1",
  },
  {
    id: "RPT-2004",
    title: "Faded traffic sign on Main Avenue",
    category: "Traffic Sign Damage",
    authority: "Road Development Authority",
    location: "Main Avenue, South District",
    priority: "Low",
    status: "Resolved",
    date: "20 Jul 2026",
    citizen: "Chiamaka Nnadi",
    image: IMG.traffic,
    description:
      "The speed limit sign at Main Avenue is heavily faded and no longer legible. The sign has now been replaced and is clearly visible to drivers.",
    ai: {
      detectedIssue: "Traffic Sign Deterioration",
      category: "Traffic Sign Damage",
      priority: "Low",
      confidence: 90,
    },
    lat: 4.79,
    lng: 7.035,
    assignedOfficer: "Officer 3",
  },
  {
    id: "RPT-2005",
    title: "Deep rut on Cedar Avenue",
    category: "Road Damage",
    authority: "Road Development Authority",
    location: "Cedar Avenue, East District",
    priority: "Medium",
    status: "Pending",
    date: "19 Jul 2026",
    citizen: "Yusuf Abdullahi",
    image: IMG.road,
    description:
      "A deep rut has formed along Cedar Avenue after heavy rains. The uneven surface is causing vehicles to bottom out and poses a risk to smaller cars and motorcycles.",
    ai: {
      detectedIssue: "Road Surface Rutting",
      category: "Road Damage",
      priority: "Medium",
      confidence: 87,
    },
    lat: 4.802,
    lng: 7.048,
    assignedOfficer: null,
  },
  {
    id: "RPT-2006",
    title: "Broken guardrail on Bay Road",
    category: "Bridge Damage",
    authority: "Road Development Authority",
    location: "Bay Road, Harbor District",
    priority: "Medium",
    status: "Resolved",
    date: "18 Jul 2026",
    citizen: "Linda Ochieng",
    image: IMG.industry,
    description:
      "A stretch of guardrail along Bay Road has been bent out of shape after a minor collision. The damaged section has been repaired and is now secure.",
    ai: {
      detectedIssue: "Guardrail Damage",
      category: "Bridge Damage",
      priority: "Medium",
      confidence: 84,
    },
    lat: 4.806,
    lng: 7.012,
    assignedOfficer: "Officer 4",
  },

  // Water Board
  {
    id: "RPT-2101",
    title: "Water leak on Maple Street",
    category: "Water Leak",
    authority: "Water Board",
    location: "Maple Street, Central District",
    priority: "High",
    status: "Pending",
    date: "24 Jul 2026",
    citizen: "Tunde Olawale",
    image: IMG.water,
    description:
      "A water pipe on Maple Street is leaking steadily, causing water loss and undermining the road foundation. Immediate repair is needed to prevent a major burst.",
    ai: {
      detectedIssue: "Underground Pipe Leak",
      category: "Water Leak",
      priority: "High",
      confidence: 91,
    },
    lat: 4.8105,
    lng: 7.0265,
    assignedOfficer: null,
  },
  {
    id: "RPT-2102",
    title: "Blocked drainage at Market Square",
    category: "Drainage",
    authority: "Water Board",
    location: "Market Square, Harbor District",
    priority: "Medium",
    status: "In Progress",
    date: "23 Jul 2026",
    citizen: "Amara Okafor",
    image: IMG.drain,
    description:
      "The drainage system at Market Square is blocked, causing water to accumulate and overflow onto the walkway during rain. This is creating an unsafe environment for vendors and pedestrians.",
    ai: {
      detectedIssue: "Drainage Blockage",
      category: "Drainage",
      priority: "Medium",
      confidence: 88,
    },
    lat: 4.806,
    lng: 7.012,
    assignedOfficer: "Officer 2",
  },
  {
    id: "RPT-2103",
    title: "Burst pipe flooding Birch Lane",
    category: "Pipeline Burst",
    authority: "Water Board",
    location: "Birch Lane, North District",
    priority: "High",
    status: "Assigned",
    date: "22 Jul 2026",
    citizen: "Ngozi Nwosu",
    image: IMG.water,
    description:
      "A major water pipe has burst on Birch Lane, flooding the street and disrupting water supply to nearby homes. An emergency crew has been dispatched.",
    ai: {
      detectedIssue: "Water Main Burst",
      category: "Pipeline Burst",
      priority: "High",
      confidence: 95,
    },
    lat: 4.8156,
    lng: 7.0498,
    assignedOfficer: "Officer 1",
  },
  {
    id: "RPT-2104",
    title: "Discoloured tap water at Elm Court",
    category: "Contaminated Water",
    authority: "Water Board",
    location: "Elm Court, West District",
    priority: "Medium",
    status: "Resolved",
    date: "21 Jul 2026",
    citizen: "Chiamaka Nnadi",
    image: IMG.water,
    description:
      "Residents at Elm Court reported discoloured tap water. Testing confirmed sedimentation from a maintenance flush; the water quality has since returned to normal.",
    ai: {
      detectedIssue: "Water Sedimentation",
      category: "Contaminated Water",
      priority: "Medium",
      confidence: 86,
    },
    lat: 4.796,
    lng: 7.018,
    assignedOfficer: "Officer 3",
  },
  {
    id: "RPT-2105",
    title: "Standing water near Community Park",
    category: "Drainage",
    authority: "Water Board",
    location: "Community Park, South District",
    priority: "Low",
    status: "Pending",
    date: "20 Jul 2026",
    citizen: "Linda Ochieng",
    image: IMG.drain,
    description:
      "Water is pooling near the entrance of Community Park due to a clogged storm drain. The standing water is attracting mosquitos and needs to be cleared.",
    ai: {
      detectedIssue: "Storm Drain Clog",
      category: "Drainage",
      priority: "Low",
      confidence: 82,
    },
    lat: 4.79,
    lng: 7.035,
    assignedOfficer: null,
  },

  //Electricity Board
  {
    id: "RPT-2201",
    title: "Street light out on River Road",
    category: "Broken Street Light",
    authority: "Electricity Board",
    location: "River Road, West District",
    priority: "Medium",
    status: "Pending",
    date: "24 Jul 2026",
    citizen: "James Adeleke",
    image: IMG.light,
    description:
      "The street light on River Road has been out for several nights, leaving the road dark and increasing the risk of accidents and crime after sunset.",
    ai: {
      detectedIssue: "Street Light Outage",
      category: "Broken Street Light",
      priority: "Medium",
      confidence: 90,
    },
    lat: 4.796,
    lng: 7.018,
    assignedOfficer: null,
  },
  {
    id: "RPT-2202",
    title: "Power outage in Industrial Zone",
    category: "Power Outage",
    authority: "Electricity Board",
    location: "Industrial Zone, East District",
    priority: "High",
    status: "In Progress",
    date: "23 Jul 2026",
    citizen: "Yusuf Abdullahi",
    image: IMG.light,
    description:
      "Several factories in the Industrial Zone are experiencing an unscheduled power outage. Technicians are on site investigating the fault in the distribution network.",
    ai: {
      detectedIssue: "Distribution Fault",
      category: "Power Outage",
      priority: "High",
      confidence: 89,
    },
    lat: 4.788,
    lng: 7.06,
    assignedOfficer: "Officer 2",
  },
  {
    id: "RPT-2203",
    title: "Sagging power line on Park Avenue",
    category: "Damaged Power Line",
    authority: "Electricity Board",
    location: "Park Avenue, Central District",
    priority: "High",
    status: "Assigned",
    date: "22 Jul 2026",
    citizen: "Amara Okafor",
    image: IMG.industry,
    description:
      "A power line on Park Avenue is sagging dangerously low over the sidewalk. Immediate attention is required to prevent a hazard to pedestrians.",
    ai: {
      detectedIssue: "Power Line Sagging",
      category: "Damaged Power Line",
      priority: "High",
      confidence: 87,
    },
    lat: 4.8105,
    lng: 7.0265,
    assignedOfficer: "Officer 1",
  },
  {
    id: "RPT-2204",
    title: "Flickering street light on Elm Street",
    category: "Broken Street Light",
    authority: "Electricity Board",
    location: "Elm Street, North District",
    priority: "Low",
    status: "Resolved",
    date: "21 Jul 2026",
    citizen: "Ngozi Nwosu",
    image: IMG.light,
    description:
      "A street light on Elm Street has been flickering intermittently. The electrical department has restored normal lighting and the issue is resolved.",
    ai: {
      detectedIssue: "Street Light Flicker",
      category: "Broken Street Light",
      priority: "Low",
      confidence: 90,
    },
    lat: 4.8156,
    lng: 7.0498,
    assignedOfficer: "Officer 3",
  },

  //Municipal Council
  {
    id: "RPT-2301",
    title: "Garbage pile-up near Green Park",
    category: "Garbage",
    authority: "Municipal Council",
    location: "Green Park, East District",
    priority: "Medium",
    status: "Pending",
    date: "24 Jul 2026",
    citizen: "Chiamaka Nnadi",
    image: IMG.garbage,
    description:
      "Garbage and waste have been piling up near the entrance of Green Park. The debris is attracting pests and creating health concerns for families using the park.",
    ai: {
      detectedIssue: "Uncollected Waste",
      category: "Garbage",
      priority: "Medium",
      confidence: 85,
    },
    lat: 4.802,
    lng: 7.048,
    assignedOfficer: null,
  },
  {
    id: "RPT-2302",
    title: "Illegal dumping in Industrial Zone",
    category: "Illegal Dumping",
    authority: "Municipal Council",
    location: "Industrial Zone, East District",
    priority: "High",
    status: "Assigned",
    date: "23 Jul 2026",
    citizen: "Tunde Olawale",
    image: IMG.garbage,
    description:
      "Construction debris has been illegally dumped in a vacant lot in the Industrial Zone. The dumping is ongoing and needs to be investigated and cleared.",
    ai: {
      detectedIssue: "Illegal Waste Dumping",
      category: "Illegal Dumping",
      priority: "High",
      confidence: 88,
    },
    lat: 4.788,
    lng: 7.06,
    assignedOfficer: "Officer 2",
  },
  {
    id: "RPT-2303",
    title: "Sweeping needed on Cobble Lane",
    category: "Street Cleanliness",
    authority: "Municipal Council",
    location: "Cobble Lane, Central District",
    priority: "Low",
    status: "Resolved",
    date: "22 Jul 2026",
    citizen: "Linda Ochieng",
    image: IMG.industry,
    description:
      "Cobble Lane has accumulated litter and leaves that have not been swept for several days. The street has been cleaned by the municipal sweepers.",
    ai: {
      detectedIssue: "Public Space Litter",
      category: "Street Cleanliness",
      priority: "Low",
      confidence: 80,
    },
    lat: 4.8105,
    lng: 7.0265,
    assignedOfficer: "Officer 1",
  },
  {
    id: "RPT-2304",
    title: "Damaged bench at Central Park",
    category: "Public Facilities",
    authority: "Municipal Council",
    location: "Central Park, South District",
    priority: "Low",
    status: "Pending",
    date: "21 Jul 2026",
    citizen: "James Adeleke",
    image: IMG.tree,
    description:
      "A public bench at Central Park has been damaged and is no longer safe to sit on. It needs to be repaired or replaced to keep the park inviting.",
    ai: {
      detectedIssue: "Public Furniture Damage",
      category: "Public Facilities",
      priority: "Low",
      confidence: 83,
    },
    lat: 4.79,
    lng: 7.035,
    assignedOfficer: null,
  },

  //Environmental Authority
  {
    id: "RPT-2401",
    title: "Thick smog over Riverside",
    category: "Air Pollution",
    authority: "Environmental Authority",
    location: "Riverside, Harbor District",
    priority: "High",
    status: "Pending",
    date: "24 Jul 2026",
    citizen: "Amara Okafor",
    image: IMG.industry,
    description:
      "Riverside is experiencing thick smog linked to nearby industrial emissions. Poor air quality is affecting residents, especially those with respiratory conditions.",
    ai: {
      detectedIssue: "Industrial Air Pollution",
      category: "Air Pollution",
      priority: "High",
      confidence: 90,
    },
    lat: 4.806,
    lng: 7.012,
    assignedOfficer: null,
  },
  {
    id: "RPT-2402",
    title: "Illegal tree clearing on Hill Road",
    category: "Deforestation",
    authority: "Environmental Authority",
    location: "Hill Road, North District",
    priority: "High",
    status: "In Progress",
    date: "23 Jul 2026",
    citizen: "Ngozi Nwosu",
    image: IMG.tree,
    description:
      "Several mature trees are being cleared illegally on Hill Road to make way for construction. Environmental officers are investigating the unauthorized activity.",
    ai: {
      detectedIssue: "Unlawful Tree Removal",
      category: "Deforestation",
      priority: "High",
      confidence: 87,
    },
    lat: 4.8156,
    lng: 7.0498,
    assignedOfficer: "Officer 2",
  },
  {
    id: "RPT-2403",
    title: "Waste burning at West Field",
    category: "Waste Burning",
    authority: "Environmental Authority",
    location: "West Field, West District",
    priority: "Medium",
    status: "Assigned",
    date: "22 Jul 2026",
    citizen: "Chiamaka Nnadi",
    image: IMG.industry,
    description:
      "Open burning of waste has been observed at West Field, releasing toxic smoke into the air. The practice poses a serious threat to local air quality and health.",
    ai: {
      detectedIssue: "Open Waste Burning",
      category: "Waste Burning",
      priority: "Medium",
      confidence: 84,
    },
    lat: 4.796,
    lng: 7.018,
    assignedOfficer: "Officer 1",
  },
  {
    id: "RPT-2404",
    title: "Chemical discharge into Lakeview",
    category: "Water Pollution",
    authority: "Environmental Authority",
    location: "Lakeview, South District",
    priority: "High",
    status: "Resolved",
    date: "21 Jul 2026",
    citizen: "Yusuf Abdullahi",
    image: IMG.water,
    description:
      "A chemical discharge was detected flowing into Lakeview from a nearby facility. The source has been contained and water tests confirm safe levels have been restored.",
    ai: {
      detectedIssue: "Water Contamination",
      category: "Water Pollution",
      priority: "High",
      confidence: 91,
    },
    lat: 4.79,
    lng: 7.035,
    assignedOfficer: "Officer 3",
  },
];

// Attach timeline data to each report for the details page.
export const authorityReports = rawReports.map((r) => ({
  ...r,
  timeline: buildTimeline(r.id, r.status, r.date),
}));

// All report statuses / priorities used across the module.
export const reportStatusOptions = [
  "Pending",
  "Assigned",
  "Accepted",
  "In Progress",
  "Resolved",
];
export const reportPriorityOptions = ["High", "Medium", "Low"];

// Helper to get a report by id (used by the details route).
export function getAuthorityReportById(id) {
  return authorityReports.find((r) => r.id === id) || null;
}

// Helper to filter reports by a given authority (by name or categories).
export function filterReportsByAuthority(reports, authority) {
  if (!authority) return [];
  return reports.filter((r) => r.authority === authority.name);
}
