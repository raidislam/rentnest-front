// Mappers: backend DTOs (lib/api/dto.ts) -> UI models (lib/types.ts), and UI
// form values -> backend request bodies. Pure functions; safe on server and client.
//
// Rules:
// - Never invent values. A field the backend doesn't provide stays undefined.
// - Fields the UI cannot work without (ids, dates, prices, statuses) are
//   validated; if missing, an ApiError("invalid_response") is thrown so the
//   problem surfaces at the API boundary instead of as a broken component.
//
// The mapped types below are derived from lib/types.ts. Where the backend
// provides less than the UI type (users, rentals, payments, reviews), the
// missing fields are optional.

import { REQUEST_STATUSES } from "@/lib/constants";
import { placeholderImages } from "@/lib/placeholders";
import type {
  Payment,
  PaymentStatus,
  Property,
  PropertyLocation,
  RentalRequest,
  RequestStatus,
  Review,
  Role,
  User,
  UserStatus,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type {
  CategoryDTO,
  CreatePropertyBody,
  PaymentDTO,
  PaymentStatusDTO,
  PropertyDetailsDTO,
  RentalDTO,
  ReviewDTO,
  UnverifiedPropertyDTO,
  UpdateUserStatusBody,
  UserDTO,
} from "./dto";
import { ApiError } from "./errors";

/* ------------------------------------------------------------------ */
/* Mapped (UI-facing) types                                            */
/* ------------------------------------------------------------------ */

export interface MappedCategory {
  id: string;
  name: string;
  description?: string;
}

/** A user as far as the backend describes them. Phone and avatar are never provided. */
export type MappedUser = Pick<User, "id" | "name"> &
  Partial<Pick<User, "email" | "phone" | "avatarUrl" | "role" | "status" | "createdAt">>;

/** The signed-in user, from GET /api/auth/me. The role is required to route the user. */
export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  role: Role;
}

/**
 * A UI Property plus the extra relations the backend embeds. Unsupported
 * fields (bedrooms, bathrooms, areaSqft, featured, status) are optional on
 * Property itself and are never set by the mapper.
 */
export type MappedProperty = Property & {
  categoryId?: string;
  category?: MappedCategory;
  /** Only `id` and `name` are provided by the backend. */
  landlord?: MappedUser;
};

export type MappedReview = Pick<Review, "id" | "rating" | "comment" | "createdAt"> &
  Partial<Pick<Review, "propertyId" | "tenantId">> & {
    tenantName?: string;
    propertyTitle?: string;
  };

export type PropertyDetails = MappedProperty & { reviews: MappedReview[] };

export type MappedPayment = Pick<Payment, "id" | "method" | "status" | "createdAt"> &
  Partial<Pick<Payment, "rentalRequestId" | "amount" | "transactionId">> & {
    rentalRequest?: MappedRentalRequest;
  };

export type MappedRentalRequest = Pick<RentalRequest, "id" | "propertyId" | "message" | "status" | "createdAt"> &
  Partial<Pick<RentalRequest, "tenantId" | "landlordId" | "monthlyRent" | "moveInDate" | "durationMonths" | "landlordNote">> & {
    property?: MappedProperty;
    tenant?: MappedUser;
    /** undefined = the endpoint didn't include payment info; null = no payment yet. */
    payment?: MappedPayment | null;
  };

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

function unexpected(field: string): never {
  throw new ApiError(`The server returned data in an unexpected format (${field}).`, { kind: "invalid_response" });
}

function required<T>(value: T | null | undefined, field: string): T {
  if (value === undefined || value === null) unexpected(`missing ${field}`);
  return value;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    unexpected(`unknown ${field} "${String(value)}"`);
  }
  return value as T;
}

/** The backend sends money as a string (Decimal), e.g. "28000". */
export function parseAmount(value: string | number | null | undefined, field: string): number {
  const amount = typeof value === "number" ? value : Number(required(value, field));
  if (!Number.isFinite(amount)) unexpected(`invalid ${field} "${String(value)}"`);
  return amount;
}

const ROLES: readonly Role[] = ["TENANT", "LANDLORD", "ADMIN"];

/* ------------------------------------------------------------------ */
/* Location: backend stores one string, the UI uses three parts        */
/* ------------------------------------------------------------------ */

/**
 * Splits "House 12, Road 5, Dhanmondi, Dhaka" into
 * { address: "House 12, Road 5", area: "Dhanmondi", city: "Dhaka" }.
 * Last part = city, second-to-last = area, the rest = address. A single part is
 * treated as the area. Missing parts are empty strings.
 */
export function parseLocation(location: string): PropertyLocation {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return { address: "", area: "", city: "" };
  if (parts.length === 1) return { address: "", area: parts[0], city: "" };
  return {
    address: parts.slice(0, -2).join(", "),
    area: parts[parts.length - 2],
    city: parts[parts.length - 1],
  };
}

/** Joins the UI's location parts into the backend's single string. Inverse of parseLocation. */
export function joinLocation({ address, area, city }: PropertyLocation): string {
  return [address, area, city]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

/* ------------------------------------------------------------------ */
/* DTO -> UI                                                           */
/* ------------------------------------------------------------------ */

export function toCategory(dto: CategoryDTO): MappedCategory {
  return {
    id: required(dto.id, "category.id"),
    name: required(dto.name, "category.name"),
    description: dto.description ?? undefined,
  };
}

/** Backend boolean status -> UI status (true = active, false = banned). */
export function toUserStatus(status: boolean): UserStatus {
  return status ? "ACTIVE" : "BANNED";
}

export function toUser(dto: UserDTO): MappedUser {
  return {
    id: required(dto.id, "user.id"),
    name: required(dto.name, "user.name"),
    email: dto.email,
    role: dto.role === undefined ? undefined : oneOf(dto.role, ROLES, "user.role"),
    status: dto.status === undefined ? undefined : toUserStatus(dto.status),
    createdAt: dto.createdAt,
  };
}

export function toSessionUser(dto: UserDTO): SessionUser {
  return {
    id: required(dto.id, "user.id"),
    name: required(dto.name, "user.name"),
    email: dto.email,
    role: oneOf(required(dto.role, "user.role"), ROLES, "user.role"),
  };
}

export function toProperty(dto: UnverifiedPropertyDTO): MappedProperty {
  const id = required(dto.id, "property.id");
  return {
    id,
    title: required(dto.title, "property.title"),
    description: dto.description ?? "",
    location: parseLocation(dto.location ?? ""),
    price: parseAmount(dto.price, "property.price"),
    type: (dto.propertyType ?? "").trim().toUpperCase(),
    amenities: dto.amenities ?? [],
    // The backend has no images yet; see lib/placeholders.ts.
    images: placeholderImages(id),
    isAvailable: required(dto.availability, "property.availability"),
    landlordId: required(dto.landlordId ?? dto.landlord?.id, "property.landlordId"),
    createdAt: required(dto.createdAt, "property.createdAt"),
    categoryId: dto.categoryId ?? dto.category?.id,
    category: dto.category ? toCategory(dto.category) : undefined,
    landlord: dto.landlord ? toUser(dto.landlord) : undefined,
  };
}

export function toReview(dto: ReviewDTO): MappedReview {
  return {
    id: required(dto.id, "review.id"),
    rating: required(dto.rating, "review.rating"),
    comment: dto.comment ?? "",
    createdAt: required(dto.createdAt, "review.createdAt"),
    propertyId: dto.propertyId ?? dto.property?.id,
    tenantId: dto.tenantId ?? dto.tenant?.id,
    tenantName: dto.tenant?.name,
    propertyTitle: dto.property?.title,
  };
}

export function toPropertyDetails(dto: PropertyDetailsDTO): PropertyDetails {
  return { ...toProperty(dto), reviews: (dto.reviews ?? []).map(toReview) };
}

/** Backend payment status -> UI payment status. */
export function toPaymentStatus(status: PaymentStatusDTO | undefined): PaymentStatus {
  switch (status) {
    case "COMPLETED":
      return "PAID";
    case "PENDING":
      return "PENDING";
    case "FAILED":
      return "FAILED";
    default:
      return unexpected(`unknown payment.status "${String(status)}"`);
  }
}

export function toPayment(dto: PaymentDTO): MappedPayment {
  return {
    id: required(dto.id, "payment.id"),
    // SSLCommerz is the only gateway the backend supports.
    method: "SSLCOMMERZ",
    status: toPaymentStatus(dto.status),
    createdAt: required(dto.createdAt, "payment.createdAt"),
    rentalRequestId: dto.rentalRequestId ?? dto.rentalRequest?.id,
    amount: dto.amount === undefined ? undefined : parseAmount(dto.amount, "payment.amount"),
    transactionId: dto.transactionId,
    rentalRequest: dto.rentalRequest ? toRentalRequest(dto.rentalRequest) : undefined,
  };
}

export function toRentalRequest(dto: RentalDTO): MappedRentalRequest {
  const property = dto.property ? toProperty(dto.property) : undefined;
  return {
    id: required(dto.id, "rental.id"),
    propertyId: required(dto.propertyId ?? dto.property?.id, "rental.propertyId"),
    message: dto.message ?? "",
    status: oneOf<RequestStatus>(dto.status, REQUEST_STATUSES, "rental.status"),
    createdAt: required(dto.createdAt, "rental.createdAt"),
    tenantId: dto.tenantId ?? dto.tenant?.id,
    landlordId: property?.landlordId,
    // The backend keeps no rent snapshot; this is the property's current price.
    monthlyRent: property?.price,
    property,
    tenant: dto.tenant ? toUser(dto.tenant) : undefined,
    payment: dto.payment === undefined ? undefined : dto.payment === null ? null : toPayment(dto.payment),
  };
}

/* ------------------------------------------------------------------ */
/* UI -> request bodies                                                */
/* ------------------------------------------------------------------ */

export function toUserStatusBody(status: UserStatus): UpdateUserStatusBody {
  return { status: status === "ACTIVE" };
}

export interface PropertyPayloadInput {
  title: string;
  description: string;
  location: PropertyLocation;
  price: number;
  amenities: string[];
  /** The category chosen in the form; its name is also sent as `propertyType`. */
  category: { id: string; name: string };
}

/** Builds the POST /api/landlord/properties body (also valid for PUT, whose fields are all optional). */
export function toPropertyBody(input: PropertyPayloadInput): CreatePropertyBody {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    location: joinLocation(input.location),
    price: input.price,
    propertyType: input.category.name,
    amenities: input.amenities,
    categoryId: input.category.id,
  };
}

export interface RentalMessageInput {
  message: string;
  fullName: string;
  email: string;
  phone: string;
  /** "YYYY-MM-DD" from the date input. */
  moveInDate: string;
  durationMonths: number;
}

/**
 * POST /api/rentals accepts only { propertyId, message }. The extra details the
 * form collects are appended to the message in a readable block so the landlord
 * still sees them.
 */
export function buildRentalMessage(input: RentalMessageInput): string {
  return [
    input.message.trim(),
    "",
    "— Applicant details —",
    `Name: ${input.fullName.trim()}`,
    `Email: ${input.email.trim()}`,
    `Phone: ${input.phone.trim()}`,
    `Preferred move-in: ${formatDate(input.moveInDate)}`,
    `Duration: ${input.durationMonths} months`,
  ].join("\n");
}
