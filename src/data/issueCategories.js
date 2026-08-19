// Keep this list in sync with ai-service/authorities.py -> ISSUE_CATEGORIES.
// The backend only understands these exact codes, so the frontend must send
// one of these values (not a free-text label) in `category`.

export const CATEGORY_LABELS = {
    ROADS_INFRASTRUCTURE: "Roads & Infrastructure",
    GARBAGE_WASTE: "Garbage & Waste",
    WATER_LEAKAGE: "Water Leakage",
    STREETLIGHT_ELECTRICAL: "Streetlight & Electrical",
    DRAINAGE_FLOODING: "Drainage & Flooding",
    ENVIRONMENTAL_ISSUES: "Environmental Issues",
    PUBLIC_SAFETY: "Public Safety",
    DISASTER_EMERGENCY: "Disaster & Emergency",
    AGRICULTURE: "Agriculture",
    ANIMAL_HEALTH: "Animal Health",
    FOREST_WILDLIFE: "Forest & Wildlife",
    COASTAL_ISSUES: "Coastal Issues",
    MARINE_POLLUTION: "Marine Pollution",
    CHILD_PROTECTION: "Child Protection",
    HOUSING: "Housing",
    CONSTRUCTION: "Construction",
    TELECOMMUNICATION: "Telecommunication",
    OTHER: "Other",
  };
  
  // [{ value: "ROADS_INFRASTRUCTURE", label: "Roads & Infrastructure" }, ...]
  export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
    ([value, label]) => ({ value, label }),
  );
  
  export function categoryLabel(code) {
    return CATEGORY_LABELS[code] || code || "Uncategorized";
  }