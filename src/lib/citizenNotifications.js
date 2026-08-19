const READ_KEY = "civiclink_notification_read";
const DELETED_KEY = "civiclink_notification_deleted";

function readIdSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeIdSet(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* ignore storage errors */
  }
}

function relativeParts(iso) {
  if (!iso) {
    return { date: "", time: "", diffDays: 99 };
  }

  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) {
    return { date: "", time: "", diffDays: 99 };
  }

  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startCreated = new Date(created);
  startCreated.setHours(0, 0, 0, 0);
  const diffDays = Math.round((startToday - startCreated) / 86_400_000);

  let date = created.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  if (diffDays === 0) date = "Today";
  else if (diffDays === 1) date = "Yesterday";
  else if (diffDays === 2) date = "2 days ago";

  const time = created.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date, time, diffDays, createdAt: created.toISOString() };
}

function pushNotification(items, report, suffix, type, title, description) {
  const when = relativeParts(report.createdAt);
  items.push({
    id: `${report.id}-${suffix}`,
    reportId: report.id,
    type,
    title,
    description,
    date: when.date,
    time: when.time,
    createdAt: when.createdAt,
    diffDays: when.diffDays,
    read: when.diffDays > 1,
  });
}

export function notificationsFromReports(reports = []) {
  const items = [];

  reports.forEach((report) => {
    const title = report.title || report.category || "civic issue";
    const authority = report.authority || "the assigned authority";

    pushNotification(
      items,
      report,
      "submitted",
      "ai",
      "Report submitted",
      `Your report ${report.id} (${title}) was received and analyzed.`,
    );

    if (["Assigned", "In Progress", "Resolved"].includes(report.status)) {
      pushNotification(
        items,
        report,
        "assigned",
        "approved",
        "Report assigned",
        `${report.id} has been assigned to ${authority}.`,
      );
    }

    if (report.status === "In Progress" || report.status === "Resolved") {
      pushNotification(
        items,
        report,
        "progress",
        "status",
        "Status updated",
        `${report.id} is now ${report.status}. ${authority} is working on it.`,
      );
    }

    if (report.status === "Resolved") {
      pushNotification(
        items,
        report,
        "resolved",
        "resolved",
        "Report resolved",
        `Great news! Your report ${report.id} has been marked as resolved.`,
      );
    }

    if (report.status === "Rejected") {
      pushNotification(
        items,
        report,
        "rejected",
        "rejected",
        "Report rejected",
        `Your report ${report.id} was rejected. Please review the details.`,
      );
    }
  });

  const deleted = readIdSet(DELETED_KEY);
  const readIds = readIdSet(READ_KEY);

  return items
    .filter((item) => !deleted.has(item.id))
    .map((item) => ({
      ...item,
      read: item.read || readIds.has(item.id),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
}

export function markNotificationRead(id) {
  const ids = readIdSet(READ_KEY);
  ids.add(id);
  writeIdSet(READ_KEY, ids);
}

export function markAllNotificationsRead(ids) {
  const stored = readIdSet(READ_KEY);
  ids.forEach((id) => stored.add(id));
  writeIdSet(READ_KEY, stored);
}

export function deleteStoredNotification(id) {
  const ids = readIdSet(DELETED_KEY);
  ids.add(id);
  writeIdSet(DELETED_KEY, ids);
}

export function unreadNotificationCount(reports = []) {
  return notificationsFromReports(reports).filter((item) => !item.read).length;
}
