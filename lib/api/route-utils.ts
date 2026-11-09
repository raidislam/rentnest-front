// Helpers for our own Route Handlers (app/api/**). Server-only.
//
// Our handlers answer with the same envelope as the backend
// ({ success, message, data } / { success: false, message, errorDetails }),
// so browser code can use unwrap() and toApiError() unchanged.

import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiFieldErrorDTO } from "./dto";
import { toApiError } from "./errors";

export function jsonOk<T>(data: T, message: string, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function jsonFail(status: number, message: string, errorDetails: ApiFieldErrorDTO[] | null = null) {
  return NextResponse.json({ success: false, message, errorDetails }, { status });
}

/**
 * Turns any error from a backend call into a response. Backend HTTP errors keep
 * their status, message and field errors; failures to reach the backend become
 * 502 (network / bad response) or 504 (timeout).
 */
export function jsonFromError(error: unknown) {
  const apiError = toApiError(error);
  const status =
    apiError.kind === "http" && apiError.status ? apiError.status : apiError.kind === "timeout" ? 504 : 502;
  if (status >= 500) console.error("[api] backend call failed:", apiError.kind, apiError.status, apiError.message);
  return jsonFail(status, apiError.message, apiError.fieldErrors.length ? apiError.fieldErrors : null);
}

/**
 * CSRF protection for cookie-authenticated, state-changing handlers: the
 * request must come from this site. (SameSite=Lax cookies already block most
 * cross-site POSTs; this also covers login CSRF and older browsers.)
 * Returns a 403 response to send back, or null if the request is allowed.
 */
export function rejectCrossSite(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (originHost !== host) return jsonFail(403, "Cross-site requests are not allowed.");
    return null;
  }
  // No Origin header: rely on Fetch Metadata when the browser sends it.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return jsonFail(403, "Cross-site requests are not allowed.");
  return null;
}

/** Parses a JSON object body, or returns a 400 response. */
export async function readJsonBody(request: NextRequest): Promise<Record<string, unknown> | NextResponse> {
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {}
  return jsonFail(400, "The request body must be a JSON object.");
}
