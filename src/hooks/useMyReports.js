import { useEffect, useState } from "react";
import { getMyReports } from "@/lib/reportService";

export function useMyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const mine = await getMyReports({ force: true });
        if (!cancelled) setReports(mine);
      } catch (err) {
        if (!cancelled) {
          setReports([]);
          setError(err?.message || "Failed to load your reports.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { reports, loading, error };
}
