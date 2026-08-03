export const notificationsData = [
  {
    id: 1,
    type: "approved",
    title: "Report Approved",
    description:
      "Your report RPT-1042 has been approved and assigned to Public Works Dept.",
    date: "Today",
    time: "10:24 AM",
    read: false,
  },
  {
    id: 2,
    type: "status",
    title: "Status Updated",
    description:
      "RPT-1040 is now In Progress. The Electrical Department is on location.",
    date: "Today",
    time: "09:15 AM",
    read: false,
  },
  {
    id: 3,
    type: "responded",
    title: "Authority Responded",
    description:
      "Water Authority responded to your report RPT-1036 with an update.",
    date: "Yesterday",
    time: "04:45 PM",
    read: false,
  },
  {
    id: 4,
    type: "ai",
    title: "AI Category Changed",
    description:
      "The AI re-categorized RPT-1035 from 'Park' to 'Public Safety'.",
    date: "Yesterday",
    time: "02:30 PM",
    read: true,
  },
  {
    id: 5,
    type: "resolved",
    title: "Report Resolved",
    description:
      "Great news! Your report RPT-1039 has been marked as resolved.",
    date: "Yesterday",
    time: "11:00 AM",
    read: true,
  },
  {
    id: 6,
    type: "rejected",
    title: "Report Rejected",
    description:
      "Your report RPT-1037 was rejected. Please review the feedback.",
    date: "2 days ago",
    time: "03:20 PM",
    read: true,
  },
  {
    id: 7,
    type: "approved",
    title: "Report Approved",
    description:
      "Your report RPT-1033 has been approved and assigned to Traffic Dept.",
    date: "2 days ago",
    time: "10:05 AM",
    read: true,
  },
  {
    id: 8,
    type: "status",
    title: "Status Updated",
    description: "RPT-1036 is now In Progress. Response team dispatched.",
    date: "3 days ago",
    time: "05:12 PM",
    read: true,
  },
  {
    id: 9,
    type: "resolved",
    title: "Report Resolved",
    description: "Your report RPT-1031 has been marked as resolved. Thank you!",
    date: "4 days ago",
    time: "01:40 PM",
    read: true,
  },
  {
    id: 10,
    type: "ai",
    title: "AI Category Changed",
    description:
      "The AI re-categorized RPT-1034 from 'Trees' to 'Garden & Green'.",
    date: "5 days ago",
    time: "09:55 AM",
    read: true,
  },
];

export const notificationCategories = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "responded", label: "Responded" },
  { key: "status", label: "Status" },
  { key: "ai", label: "AI" },
  { key: "resolved", label: "Resolved" },
];
