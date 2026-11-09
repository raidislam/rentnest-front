// Same-origin pass-through for Client Components: /api/backend/<path> -> <API_BASE_URL>/api/<path>.
//
// - Only documented endpoints/methods (lib/api/backend-routes.ts); fixed backend URL.
// - Reads the JWT from the HttpOnly cookie and sends it as a Bearer token, so
//   browser JavaScript never sees it.
// - Forwards only Accept / Content-Type / Authorization; never the browser's
//   Cookie or Host, never the backend's Set-Cookie.
// - Preserves query string, JSON body, status code and response body.
// The backend stays the authority for authentication and roles.

import { NextResponse, type NextRequest } from "next/server";
import { checkBackendRoute } from "@/lib/api/backend-routes";
import { getApiBaseUrl } from "@/lib/api/config";
import { REQUEST_TIMEOUT_MS } from "@/lib/api/http";
import { jsonFail, rejectCrossSite } from "@/lib/api/route-utils";
import { getSessionToken } from "@/lib/auth/session";

type Context = { params: Promise<{ path: string[] }> };

const ERRORS = {
  400: "Invalid API path.",
  404: "This API endpoint is not available.",
  405: "This method is not allowed for this endpoint.",
} as const;

async function forward(request: NextRequest, { params }: Context) {
  const method = request.method;
  const { path } = await params;

  const route = checkBackendRoute(method, path);
  if (!route.ok) return jsonFail(route.status, ERRORS[route.status]);

  // CSRF: state-changing requests must come from this site.
  if (method !== "GET") {
    const blocked = rejectCrossSite(request);
    if (blocked) return blocked;
  }

  // Only JSON bodies are accepted (every documented frontend request body is JSON).
  const body = method === "GET" ? "" : await request.text();
  if (body && !(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return jsonFail(415, "Request body must be JSON (Content-Type: application/json).");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (route.auth) {
    const token = await getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getApiBaseUrl()}/${route.path}${request.nextUrl.search}`, {
      method,
      headers,
      body: body || undefined,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error("[api/backend] upstream request failed:", method, route.path, error);
    return timedOut
      ? jsonFail(504, "The server is taking too long to respond. Please try again.")
      : jsonFail(502, "We can't reach the RentNest server. Please try again.");
  }

  // Pass status and body through; copy only the content type (no Set-Cookie, no Location).
  const responseBody = upstream.status === 204 || upstream.status === 304 ? null : await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" },
  });
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
