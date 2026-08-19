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
    /* ignore */
  }
}

const ADMIN_SEEN_REPORTS = "civiclink_admin_seen_reports";
const CITIZEN_SEEN_REPORTS = "civiclink_citizen_seen_reports";

export function unseenReportCount(reports = [], key = ADMIN_SEEN_REPORTS) {
  const seen = readIdSet(key);
  return reports.filter((report) => report?.id && !seen.has(report.id)).length;
}

export function markReportsSeen(ids = [], key = ADMIN_SEEN_REPORTS) {
  const stored = readIdSet(key);
  ids.filter(Boolean).forEach((id) => stored.add(id));
  writeIdSet(key, stored);
}

export const REPORT_SEEN_KEYS = {
  admin: ADMIN_SEEN_REPORTS,
  citizen: CITIZEN_SEEN_REPORTS,
};
