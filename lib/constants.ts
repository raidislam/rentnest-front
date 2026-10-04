import type { Amenity, Category, RequestStatus } from "./types";

// Will come from GET /api/categories once the API is connected.
export const PROPERTY_TYPES: Category[] = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "STUDIO", label: "Studio" },
  { value: "DUPLEX", label: "Duplex" },
  { value: "VILLA", label: "Villa" },
];

export const AMENITIES: Amenity[] = [
  "Air conditioning",
  "Wi-Fi",
  "Parking",
  "Lift",
  "Generator backup",
  "24/7 security",
  "Gym",
  "Swimming pool",
  "Furnished",
  "Balcony",
  "Garden",
  "Rooftop access",
];

/** Price range presets used by search forms. Values are "min-max" in BDT; empty max = no upper bound. */
export const PRICE_RANGES = [
  { value: "0-25000", label: "Under ৳25,000" },
  { value: "25000-50000", label: "৳25,000 – ৳50,000" },
  { value: "50000-100000", label: "৳50,000 – ৳1,00,000" },
  { value: "100000-", label: "Above ৳1,00,000" },
];

export const REQUEST_STATUSES: RequestStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVE",
  "COMPLETED",
];
