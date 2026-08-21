export const INBOX_CHANGED_EVENT = "civiclink:inbox-changed";

export function emitInboxChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));
}
