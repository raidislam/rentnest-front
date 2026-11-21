// Domain types shared across the UI. Backend responses are converted into these
// (or the derived Mapped* types) by lib/api/mappers.ts; fields the backend doesn't
// provide are optional and rendered only when present.

export type Role = "TENANT" | "LANDLORD" | "ADMIN";

export type UserStatus = "ACTIVE" | "BANNED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl: string;
  status: UserStatus;
  createdAt: string; // ISO date
}

export type PropertyType = "APARTMENT" | "HOUSE" | "STUDIO" | "DUPLEX" | "VILLA";

/** Moderation status of a listing (admin review). */
export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Amenity =
  | "Air conditioning"
  | "WiFi"
  | "Parking"
  | "Lift"
  | "Generator backup"
  | "24/7 security"
  | "Gym"
  | "Swimming pool"
  | "Furnished"
  | "Balcony"
  | "Garden"
  | "Rooftop access";

export interface PropertyLocation {
  address: string;
  area: string;
  city: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: PropertyLocation;
  /** Monthly rent in BDT. */
  price: number;
  /**
   * Upper-case property type, e.g. "APARTMENT". The backend stores free text,
   * so this is not limited to PropertyType; use propertyTypeLabel() to display it.
   */
  type: string;
  // Not supported by the backend yet: undefined for API data, rendered only when present.
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  /** Amenity names as stored by the backend (free text, e.g. "WiFi"). */
  amenities: string[];
  /** Placeholder photos until the backend supports image upload (see lib/placeholders.ts). */
  images: string[];
  isAvailable: boolean;
  /** Admin moderation status. Not supported by the backend yet. */
  status?: PropertyStatus;
  /** Optional admin note, e.g. why a listing was not approved. */
  moderationNote?: string;
  /** Not supported by the backend yet. */
  featured?: boolean;
  landlordId: string;
  createdAt: string;
}

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED";

export interface RentalRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  moveInDate: string;
  durationMonths: number;
  message: string;
  /** Rent snapshot at the time of the request, in BDT. */
  monthlyRent: number;
  status: RequestStatus;
  /** Optional note from the landlord, e.g. a reason for rejection. */
  landlordNote?: string;
  createdAt: string;
}

export type PaymentMethod = "STRIPE" | "SSLCOMMERZ";

export type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "CANCELLED";

export interface Payment {
  id: string;
  rentalRequestId: string;
  tenantId: string;
  amount: number;
  currency: "BDT";
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  tenantId: string;
  rating: number; // 1–5
  comment: string;
  createdAt: string;
}

export interface Category {
  value: PropertyType;
  label: string;
}

