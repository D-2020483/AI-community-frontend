export const AUTHORITY_TYPE = {
  ROAD: "Road Development Authority",
  WATER: "Water Board",
  ELECTRICITY: "Electricity Board",
  MUNICIPAL: "Municipal Council",
  ENVIRONMENT: "Environmental Authority",
};

// Mock authority data for testing and development purposes.
export const mockAuthorities = [
  {
    id: "auth-road",
    name: AUTHORITY_TYPE.ROAD,
    type: "road",
    email: "road@civiclink.com",
    password: "123456",
    shortCode: "RDA",
    color: "from-indigo-600 to-violet-600",
    description:
      "Maintains roads, bridges, highways and traffic infrastructure.",
    categories: [
      "Road Damage",
      "Bridge Damage",
      "Road Block",
      "Traffic Sign Damage",
    ],
  },
  {
    id: "auth-water",
    name: AUTHORITY_TYPE.WATER,
    type: "water",
    email: "water@civiclink.com",
    password: "123456",
    shortCode: "WB",
    color: "from-sky-600 to-blue-600",
    description: "Manages water supply, pipelines, drainage and flood control.",
    categories: [
      "Water Leak",
      "Drainage",
      "Pipeline Burst",
      "Contaminated Water",
    ],
  },
  {
    id: "auth-electricity",
    name: AUTHORITY_TYPE.ELECTRICITY,
    type: "electricity",
    email: "electricity@civiclink.com",
    password: "123456",
    shortCode: "EB",
    color: "from-amber-500 to-orange-600",
    description:
      "Handles street lighting, power lines and electrical infrastructure.",
    categories: ["Broken Street Light", "Power Outage", "Damaged Power Line"],
  },
  {
    id: "auth-municipal",
    name: AUTHORITY_TYPE.MUNICIPAL,
    type: "municipal",
    email: "municipal@civiclink.com",
    password: "123456",
    shortCode: "MC",
    color: "from-emerald-600 to-teal-600",
    description:
      "Oversees public spaces, waste collection and city cleanliness.",
    categories: [
      "Garbage",
      "Illegal Dumping",
      "Street Cleanliness",
      "Public Facilities",
    ],
  },
  {
    id: "auth-environment",
    name: AUTHORITY_TYPE.ENVIRONMENT,
    type: "environment",
    email: "environment@civiclink.com",
    password: "123456",
    shortCode: "EA",
    color: "from-green-600 to-emerald-600",
    description: "Monitors environmental health, green spaces and pollution.",
    categories: [
      "Air Pollution",
      "Deforestation",
      "Waste Burning",
      "Water Pollution",
    ],
  },
];

// Convenience helper to resolve an authority by stored type/email.
export function findAuthorityByEmail(email) {
  return mockAuthorities.find(
    (a) => a.email.toLowerCase() === (email || "").toLowerCase(),
  );
}

export function findAuthorityByType(type) {
  return mockAuthorities.find((a) => a.type === type);
}
