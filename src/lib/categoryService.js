import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from "@/data/issueCategories";

export function toIssueCategoryOptions(categories = []) {
  return categories
    .filter((category) => category.status !== "Inactive")
    .map((category) => ({
      value: category.code || category.name,
      label: category.name,
    }));
}

export function labelForCategory(code, options = CATEGORY_OPTIONS) {
  const match = options.find(
    (option) => option.value === code || option.label === code,
  );
  return match?.label || CATEGORY_LABELS[code] || code || "Uncategorized";
}

export function useIssueCategories() {
  const [options, setOptions] = useState(CATEGORY_OPTIONS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await apiRequest("/categories");
        const next = toIssueCategoryOptions(data.data?.categories || []);
        if (!cancelled && next.length) setOptions(next);
      } catch {
        if (!cancelled) setOptions(CATEGORY_OPTIONS);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
