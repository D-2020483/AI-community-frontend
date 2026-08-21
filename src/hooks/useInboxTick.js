import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { INBOX_CHANGED_EVENT } from "@/lib/inboxEvents";

export function useInboxTick(intervalMs = 30_000) {
  const location = useLocation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((value) => value + 1);
    window.addEventListener(INBOX_CHANGED_EVENT, bump);
    const timer = setInterval(bump, intervalMs);
    return () => {
      window.removeEventListener(INBOX_CHANGED_EVENT, bump);
      clearInterval(timer);
    };
  }, [intervalMs]);

  return `${location.pathname}:${tick}`;
}
