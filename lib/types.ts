// Domain types shared across the UI.
// Shapes mirror the planned backend responses so mock data can later be
// swapped for API calls without touching components.

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
  | "Wi-Fi"
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
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  amenities: Amenity[];
  images: string[];
  isAvailable: boolean;
  status: PropertyStatus;
  /** Optional admin note, e.g. why a listing was not approved. */
  moderationNote?: string;
  featured: boolean;
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

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  pendingProperties: number;
  pendingRequests: number;
}

/** A rental request joined with the records the dashboards display alongside it. */
export interface RentalRequestDetails extends RentalRequest {
  property: Property;
  landlord: User;
  tenant: User;
  /** Payment attempts for this request, newest first. */
  payments: Payment[];
  /** The tenant's review of this property, if they have left one. */
  review?: Review;
}

/** A request as the landlord sees it. `property` is missing if the listing was deleted. */
export interface LandlordRequestView extends RentalRequest {
  property?: Property;
  tenant: User;
  payments: Payment[];
}

/** Fields a landlord controls when creating or editing a listing. */
export type PropertyInput = Pick<
  Property,
  | "title"
  | "description"
  | "location"
  | "price"
  | "type"
  | "bedrooms"
  | "bathrooms"
  | "areaSqft"
  | "amenities"
  | "images"
  | "isAvailable"
>;

/** A request as an admin sees it: everyone involved, plus payments. */
export interface AdminRequestView extends LandlordRequestView {
  landlord: User;
}

/** A property joined with its landlord, for moderation. */
export interface AdminPropertyView extends Property {
  landlord?: User;
}
