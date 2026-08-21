import { emitInboxChanged } from "@/lib/inboxEvents";

const readKey = (role) => `civiclink_${role}_notification_read`;
const deletedKey = (role) => `civiclink_${role}_notification_deleted`;

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

export function applyWorkspaceNotificationState(role, items = []) {
  const deleted = readIdSet(deletedKey(role));
  const readIds = readIdSet(readKey(role));
  return items
    .filter((item) => !deleted.has(item.id))
    .map((item) => ({
      ...item,
      read: Boolean(item.read) || readIds.has(item.id),
    }));
}

export function markWorkspaceNotificationRead(role, id) {
  const ids = readIdSet(readKey(role));
  ids.add(id);
  writeIdSet(readKey(role), ids);
}

export function markAllWorkspaceNotificationsRead(role, ids) {
  const stored = readIdSet(readKey(role));
  ids.forEach((id) => stored.add(id));
  writeIdSet(readKey(role), stored);
}

export function deleteWorkspaceNotification(role, id) {
  const ids = readIdSet(deletedKey(role));
  ids.add(id);
  writeIdSet(deletedKey(role), ids);
}

export function clearWorkspaceNotifications(role, ids) {
  const stored = readIdSet(deletedKey(role));
  ids.forEach((id) => stored.add(id));
  writeIdSet(deletedKey(role), stored);
}
