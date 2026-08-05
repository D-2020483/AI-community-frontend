const IMG = {
  road: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
  bridge:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop",
  water:
    "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?q=80&w=1000&auto=format&fit=crop",
  light:
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
  drain:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
  traffic:
    "https://images.unsplash.com/photo-1549921296-3b0f9a35af35?q=80&w=1000&auto=format&fit=crop",
  garbage:
    "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?q=80&w=1000&auto=format&fit=crop",
};

// Build a shared activity timeline for a task.
function buildTimeline(id, status, date) {
  const base = [
    {
      label: "Assigned",
      text: "Task assigned to you",
      time: `${date} · 09:12 AM`,
    },
  ];
  if (
    status === "Accepted" ||
    status === "In Progress" ||
    status === "Completed"
  ) {
    base.push({
      label: "Accepted",
      text: "You accepted the task",
      time: `${date} · 09:40 AM`,
    });
  }
  if (status === "In Progress" || status === "Completed") {
    base.push({
      label: "In Progress",
      text: "Field work in progress",
      time: `${date} · 11:15 AM`,
    });
  }
  if (status === "Completed") {
    base.push({
      label: "Completed",
      text: "Task completed & submitted",
      time: `${date} · 03:30 PM`,
    });
  }
  return base;
}

const rawTasks = [
  {
    id: "TSK-1042",
    reportId: "RPT-2003",
    title: "Road blocked by fallen tree",
    type: "Road Block",
    category: "Road Block",
    priority: "High",
    status: "Accepted",
    location: "Highway 12, Industrial Zone",
    date: "21 Jul 2026",
    citizen: "Ngozi Nwosu",
    image: IMG.traffic,
    description:
      "A tree has fallen across both lanes of Highway 12 near the industrial exit, completely blocking traffic. Emergency clearing is required to restore the flow of vehicles.",
    lat: 4.788,
    lng: 7.06,
    assignedOfficer: "Samuel Johnson",
  },
  {
    id: "TSK-1043",
    reportId: "RPT-2001",
    title: "Large pothole on Oak Street",
    type: "Road Damage",
    category: "Road Damage",
    priority: "High",
    status: "Assigned",
    location: "Oak Street, North District",
    date: "24 Jul 2026",
    citizen: "Amara Okafor",
    image: IMG.road,
    description:
      "A large pothole has formed on the eastbound lane of Oak Street. Vehicles are swerving to avoid it, creating a serious safety hazard for commuters and cyclists during rush hour.",
    lat: 4.8156,
    lng: 7.0498,
    assignedOfficer: "Samuel Johnson",
  },
  {
    id: "TSK-1044",
    reportId: "RPT-2002",
    title: "Cracked bridge railing on River Bridge",
    type: "Bridge Damage",
    category: "Bridge Damage",
    priority: "High",
    status: "In Progress",
    location: "River Bridge, Central",
    date: "22 Jul 2026",
    citizen: "James Adeleke",
    image: IMG.bridge,
    description:
      "The concrete railing on the western side of River Bridge has cracked and a section has broken away. Pedestrians are at risk and the structural integrity needs urgent inspection.",
    lat: 4.813,
    lng: 7.032,
    assignedOfficer: "Samuel Johnson",
  },
  {
    id: "TSK-1045",
    reportId: "RPT-2005",
    title: "Deep rut on Cedar Avenue",
    type: "Road Damage",
    category: "Road Damage",
    priority: "Medium",
    status: "Assigned",
    location: "Cedar Avenue, East District",
    date: "19 Jul 2026",
    citizen: "Yusuf Abdullahi",
    image: IMG.road,
    description:
      "A deep rut has formed along Cedar Avenue after heavy rains. The uneven surface is causing vehicles to bottom out and poses a risk to smaller cars and motorcycles.",
    lat: 4.802,
    lng: 7.048,
    assignedOfficer: "Samuel Johnson",
  },
  {
    id: "TSK-1046",
    reportId: "RPT-2004",
    title: "Faded traffic sign on Main Avenue",
    type: "Traffic Sign Damage",
    category: "Traffic Sign Damage",
    priority: "Low",
    status: "Completed",
    location: "Main Avenue, South District",
    date: "20 Jul 2026",
    citizen: "Chiamaka Nnadi",
    image: IMG.traffic,
    description:
      "The speed limit sign at Main Avenue is heavily faded and no longer legible. The sign has now been replaced and is clearly visible to drivers.",
    lat: 4.79,
    lng: 7.035,
    assignedOfficer: "Samuel Johnson",
  },
  {
    id: "TSK-1047",
    reportId: "RPT-2006",
    title: "Broken guardrail on Bay Road",
    type: "Bridge Damage",
    category: "Bridge Damage",
    priority: "Medium",
    status: "Completed",
    location: "Bay Road, Harbor District",
    date: "18 Jul 2026",
    citizen: "Linda Ochieng",
    image: IMG.bridge,
    description:
      "A stretch of guardrail along Bay Road has been bent out of shape after a minor collision. The damaged section has been repaired and is now secure.",
    lat: 4.806,
    lng: 7.012,
    assignedOfficer: "Samuel Johnson",
  },
];

// Attach timeline data to each task.
export const officerTasks = rawTasks.map((t) => ({
  ...t,
  timeline: buildTimeline(t.reportId, t.status, t.date),
}));

// Task status options available to an officer.
export const officerTaskStatusOptions = [
  "Assigned",
  "Accepted",
  "In Progress",
  "Completed",
];

// Helper to get a single task by id.
export function getOfficerTaskById(id) {
  return officerTasks.find((t) => t.id === id) || null;
}

// Mock officer login credentials (simulated auth).
export const mockOfficerCredential = {
  name: "Samuel Johnson",
  email: "samuel.johnson@civiclink.com",
  password: "123456",
};
