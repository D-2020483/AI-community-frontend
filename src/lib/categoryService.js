import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { CATEGORY_LABELS } from "@/data/issueCategories";

export function toIssueCategoryOptions(categories = []) {
  return categories
    .filter((category) => category.status !== "Inactive")
    .map((category) => ({
      value: category.code || category.name,
      label: category.name,
    }));
}

export function toAllCategoryOptions(categories = []) {
  return categories.map((category) => ({
    value: category.code || category.name,
    label: category.name,
  }));
}

export function labelForCategory(code, options = []) {
  const match = options.find(
    (option) => option.value === code || option.label === code,
  );
  return match?.label || CATEGORY_LABELS[code] || code || "Uncategorized";
}

export function matchesCategoryFilter(reportCategory, selected, options = []) {
  if (!selected || selected === "All Categories") return true;
  const value = String(reportCategory || "");
  if (value === selected) return true;
  const match = options.find(
    (option) => option.label === selected || option.value === selected,
  );
  if (!match) return false;
  return value === match.label || value === match.value;
}

export function useIssueCategories({ source = "public" } = {}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const path = source === "admin" ? "/admin/categories" : "/categories";
        const data = await apiRequest(path);
        const rows = data.data?.categories || [];
        const next =
          source === "admin"
            ? toAllCategoryOptions(rows)
            : toIssueCategoryOptions(rows);
        if (!cancelled) setOptions(next);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setOptions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [source]);

  return { options, loading, error };
}
