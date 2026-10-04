// Simulated async actions for the frontend-only phase. Each function mirrors
// a future backend call; replace the body with a fetch() when integrating.

import { getMockState, updateMockState } from "./mock-store";
import type { PaymentMethod, Property, PropertyInput, RequestStatus, Review, Role, User, UserStatus } from "./types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RentalRequestInput {
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  moveInDate: string;
  durationMonths: number;
  message: string;
}

/**
 * Future: POST /api/rentals
 * Demo hook: an email ending in "@fail.test" simulates a server failure.
 */
export async function submitRentalRequest(input: RentalRequestInput): Promise<{ id: string }> {
  await wait(1200);
  if (input.email.toLowerCase().endsWith("@fail.test")) {
    throw new Error("The server could not process this request.");
  }
  return { id: `r-${Date.now().toString().slice(-4)}` };
}

/* ------------------------------------------------------------------ */
/* Auth (no real authentication yet)                                   */
/* ------------------------------------------------------------------ */

/** Password accepted for every mock account. */
export const DEMO_PASSWORD = "Password123";

export class MockApiError extends Error {}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "TENANT" | "LANDLORD">;
}

/** Future: POST /api/auth/register */
export async function registerUser(input: RegisterInput): Promise<Pick<User, "name" | "email" | "role">> {
  await wait(1200);
  if (getMockState().users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new MockApiError("An account with this email already exists. Try logging in instead.");
  }
  return { name: input.name, email: input.email, role: input.role };
}

/** Future: POST /api/auth/login */
export async function loginUser(email: string, password: string): Promise<Pick<User, "id" | "name" | "role">> {
  await wait(1000);
  // Reads the mock store, so a user banned by an admin this session can't log in.
  const user = getMockState().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || password !== DEMO_PASSWORD) {
    throw new MockApiError("Incorrect email or password. Please try again.");
  }
  if (user.status === "BANNED") {
    throw new MockApiError("This account has been suspended. Please contact RentNest support.");
  }
  return { id: user.id, name: user.name, role: user.role };
}

/** Future: POST /api/auth/forgot-password */
export async function requestPasswordReset(email: string): Promise<void> {
  void email;
  await wait(1000);
}

/* ------------------------------------------------------------------ */
/* Payments & reviews                                                  */
/* ------------------------------------------------------------------ */

const randomRef = (length: number) =>
  Array.from({ length }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

export interface MockPaymentResult {
  transactionId: string;
  paidAt: string;
}

/**
 * Future: POST /api/payments/create, which returns a Stripe Checkout or
 * SSLCommerz gateway URL to redirect to. For now this only simulates the
 * round trip and returns a fake reference — nothing is charged.
 */
export async function submitMockPayment(input: { rentalRequestId: string; method: PaymentMethod }): Promise<MockPaymentResult> {
  await wait(1600);
  const transactionId = input.method === "SSLCOMMERZ" ? `SSL-${randomRef(8)}` : `pi_${randomRef(14)}`;
  return { transactionId, paidAt: new Date().toISOString() };
}

export interface ReviewInput {
  propertyId: string;
  rentalRequestId: string;
  rating: number;
  comment: string;
}

/** Future: POST /api/reviews */
export async function submitReview(input: ReviewInput): Promise<Review> {
  await wait(1100);
  return {
    id: `rv-${Date.now().toString().slice(-5)}`,
    propertyId: input.propertyId,
    tenantId: "",
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Landlord: properties & requests (write to the in-memory mock store) */
/* ------------------------------------------------------------------ */

function requireProperty(id: string): Property {
  const property = getMockState().properties.find((p) => p.id === id);
  if (!property) throw new MockApiError("This property no longer exists.");
  return property;
}

/** Future: POST /api/landlord/properties — new listings start out pending admin review. */
export async function createProperty(landlordId: string, input: PropertyInput): Promise<Property> {
  await wait(1200);
  const property: Property = {
    ...input,
    id: `p-${Date.now().toString().slice(-6)}`,
    landlordId,
    status: "PENDING",
    featured: false,
    createdAt: new Date().toISOString(),
  };
  updateMockState((s) => ({ ...s, properties: [property, ...s.properties] }));
  return property;
}

/** Future: PATCH /api/landlord/properties/:id */
export async function updateProperty(id: string, input: PropertyInput): Promise<Property> {
  await wait(1000);
  const updated = { ...requireProperty(id), ...input };
  updateMockState((s) => ({ ...s, properties: s.properties.map((p) => (p.id === id ? updated : p)) }));
  return updated;
}

/** Future: PATCH /api/landlord/properties/:id with { isAvailable } */
export async function setPropertyAvailability(id: string, isAvailable: boolean): Promise<void> {
  await wait(600);
  requireProperty(id);
  updateMockState((s) => ({
    ...s,
    properties: s.properties.map((p) => (p.id === id ? { ...p, isAvailable } : p)),
  }));
}

/** Future: DELETE /api/landlord/properties/:id — existing rental requests are kept for history. */
export async function deleteProperty(id: string): Promise<void> {
  await wait(900);
  requireProperty(id);
  updateMockState((s) => ({ ...s, properties: s.properties.filter((p) => p.id !== id) }));
}

/**
 * Future: PATCH /api/landlord/requests/:id with { status, note }.
 * `simulateFailure` lets the UI demo its rollback path.
 */
export async function updateRentalRequestStatus(
  id: string,
  status: Extract<RequestStatus, "APPROVED" | "REJECTED">,
  options: { note?: string; simulateFailure?: boolean } = {},
): Promise<void> {
  await wait(1200);
  if (options.simulateFailure) throw new MockApiError("The server couldn't update this request.");
  const request = getMockState().requests.find((r) => r.id === id);
  if (!request) throw new MockApiError("This request no longer exists.");
  if (request.status !== "PENDING") throw new MockApiError("Only pending requests can be approved or rejected.");
  updateMockState((s) => ({
    ...s,
    requests: s.requests.map((r) =>
      r.id === id ? { ...r, status, landlordNote: options.note?.trim() || undefined } : r,
    ),
  }));
}

/* ------------------------------------------------------------------ */
/* Admin: users & property moderation                                  */
/* ------------------------------------------------------------------ */

/** Future: PATCH /api/admin/users/:id with { status } — admin accounts can't be banned. */
export async function updateUserStatus(
  id: string,
  status: UserStatus,
  options: { simulateFailure?: boolean } = {},
): Promise<void> {
  await wait(1000);
  if (options.simulateFailure) throw new MockApiError("The server couldn't update this account.");
  const user = getMockState().users.find((u) => u.id === id);
  if (!user) throw new MockApiError("This user no longer exists.");
  if (user.role === "ADMIN") throw new MockApiError("Admin accounts can't be banned.");
  updateMockState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) }));
}

/** Future: PATCH /api/admin/properties/:id with { status, note } — only pending listings can be moderated. */
export async function updatePropertyModerationStatus(
  id: string,
  status: Extract<Property["status"], "APPROVED" | "REJECTED">,
  options: { note?: string; simulateFailure?: boolean } = {},
): Promise<void> {
  await wait(1000);
  if (options.simulateFailure) throw new MockApiError("The server couldn't update this listing.");
  const property = requireProperty(id);
  if (property.status !== "PENDING") throw new MockApiError("This listing has already been reviewed.");
  updateMockState((s) => ({
    ...s,
    properties: s.properties.map((p) =>
      p.id === id ? { ...p, status, moderationNote: options.note?.trim() || undefined } : p,
    ),
  }));
}
