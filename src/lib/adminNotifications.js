import { emitInboxChanged } from "@/lib/inboxEvents";

const READ_KEY = "civiclink_admin_notification_read";
const DELETED_KEY = "civiclink_admin_notification_deleted";

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
  emitInboxChanged();
}

export function applyAdminNotificationState(items = []) {
  const deleted = readIdSet(DELETED_KEY);
  const readIds = readIdSet(READ_KEY);
  return items
    .filter((item) => !deleted.has(item.id))
    .map((item) => ({
      ...item,
      read: Boolean(item.read) || readIds.has(item.id) || item.diffDays > 2,
    }));
}

export function markAdminNotificationRead(id) {
  const ids = readIdSet(READ_KEY);
  ids.add(id);
  writeIdSet(READ_KEY, ids);
}

export function markAllAdminNotificationsRead(ids) {
  const stored = readIdSet(READ_KEY);
  ids.forEach((id) => stored.add(id));
  writeIdSet(READ_KEY, stored);
}

export function deleteAdminNotification(id) {
  const ids = readIdSet(DELETED_KEY);
  ids.add(id);
  writeIdSet(DELETED_KEY, ids);
}

export function clearAdminNotifications(ids) {
  const stored = readIdSet(DELETED_KEY);
  ids.forEach((id) => stored.add(id));
  writeIdSet(DELETED_KEY, stored);
}
