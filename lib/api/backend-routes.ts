// Allowlist for the browser pass-through (app/api/backend/[...path]/route.ts).
// Every entry is a documented endpoint from the Postman collection; anything
// else is rejected. Server-only.
//
// Deliberately excluded:
// - POST /auth/login and /auth/register: their responses contain the JWT, so
//   the browser uses the /api/auth/* Route Handlers instead (HttpOnly cookie).
// - /payments/success|fail|cancel|ipn: called by SSLCommerz, not the frontend.

import "server-only";

export type BackendMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface BackendRoute {
  method: BackendMethod;
  /** Path below /api, ":id" matches one ID segment. */
  path: string;
  /** Send the session JWT as a Bearer token (documented as Bearer-protected). */
  auth: boolean;
}

const ROUTES: BackendRoute[] = [
  // Auth
  { method: "GET", path: "auth/me", auth: true },
  { method: "PATCH", path: "auth/me", auth: true },
  // Public
  { method: "GET", path: "categories", auth: false },
  { method: "GET", path: "properties", auth: false },
  { method: "GET", path: "properties/:id", auth: false },
  // Landlord
  { method: "GET", path: "landlord/properties", auth: true },
  { method: "POST", path: "landlord/properties", auth: true },
  { method: "PUT", path: "landlord/properties/:id", auth: true },
  { method: "DELETE", path: "landlord/properties/:id", auth: true },
  { method: "GET", path: "landlord/requests", auth: true },
  { method: "PATCH", path: "landlord/requests/:id", auth: true },
  { method: "GET", path: "landlord/reviews", auth: true },
  // Tenant
  { method: "POST", path: "rentals", auth: true },
  { method: "GET", path: "rentals", auth: true },
  { method: "GET", path: "rentals/:id", auth: true },
  { method: "PATCH", path: "rentals/:id/complete", auth: true },
  { method: "POST", path: "payments/create", auth: true },
  { method: "POST", path: "payments/confirm", auth: true },
  { method: "GET", path: "payments", auth: true },
  { method: "GET", path: "payments/:id", auth: true },
  { method: "POST", path: "reviews", auth: true },
  // Admin
  { method: "GET", path: "admin/users", auth: true },
  { method: "PATCH", path: "admin/users/:id", auth: true },
  { method: "GET", path: "admin/properties", auth: true },
  { method: "GET", path: "admin/rentals", auth: true },
  { method: "POST", path: "admin/categories", auth: true },
  { method: "PUT", path: "admin/categories/:id", auth: true },
  { method: "DELETE", path: "admin/categories/:id", auth: true },
];

/** One safe path segment: letters, digits, "-" and "_" only (blocks "..", "/", "\", "%", ":" and URLs). */
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;

function matches(pattern: string, segments: string[]): boolean {
  const parts = pattern.split("/");
  return parts.length === segments.length && parts.every((part, i) => part === ":id" || part === segments[i]);
}

export type RouteCheck =
  | { ok: true; path: string; auth: boolean }
  | { ok: false; status: 400 | 404 | 405 };

/** Validates the requested path and method against the documented allowlist. */
export function checkBackendRoute(method: string, segments: string[]): RouteCheck {
  if (segments.length === 0 || !segments.every((s) => SAFE_SEGMENT.test(s))) return { ok: false, status: 400 };
  const sameRoute = ROUTES.filter((r) => matches(r.path, segments));
  if (sameRoute.length === 0) return { ok: false, status: 404 };
  const route = sameRoute.find((r) => r.method === method);
  if (!route) return { ok: false, status: 405 };
  return { ok: true, path: segments.join("/"), auth: route.auth };
}
