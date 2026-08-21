import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { applyWorkspaceNotificationState } from "@/lib/workspaceNotifications";
import { unseenReportCount } from "@/lib/reportBadges";
import { useInboxTick } from "@/hooks/useInboxTick";

export function useWorkspaceInbox({
  role,
  fetchItems,
  fetchNotifications,
  itemsPath,
  notificationsPath,
  seenKey,
}) {
  const location = useLocation();
  const tick = useInboxTick();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenItems, setUnseenItems] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [items, notes] = await Promise.all([
          fetchItems(),
          fetchNotifications(),
        ]);
        if (cancelled) return;
        const notifications = applyWorkspaceNotificationState(role, notes);
        const unread = notifications.filter((item) => !item.read).length;
        setUnseenItems(
          location.pathname.startsWith(itemsPath)
            ? 0
            : unseenReportCount(items, seenKey),
        );
        setUnreadCount(unread);
      } catch {
        if (!cancelled) {
          setUnseenItems(0);
          setUnreadCount(0);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    fetchItems,
    fetchNotifications,
    itemsPath,
    location.pathname,
    notificationsPath,
    role,
    seenKey,
    tick,
  ]);

  const notificationBadge = location.pathname.startsWith(notificationsPath)
    ? 0
    : unreadCount;

  return { unreadCount, notificationBadge, unseenItems };
}
