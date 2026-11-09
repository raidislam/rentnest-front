// Server-only API configuration.
//
// API_BASE_URL has no NEXT_PUBLIC_ prefix, so Next.js never inlines it into the
// browser bundle. The `server-only` import makes the build fail if a Client
// Component ever imports this file (directly or through another module).

import "server-only";

/** Names of the session cookies. Both are HttpOnly and set only by Route Handlers. */
export const SESSION_COOKIE = "rn_token";
/** Holds the user's role so proxy.ts can make quick redirect decisions. Never trusted for authorization. */
export const ROLE_COOKIE = "rn_role";

/**
 * The backend API root, e.g. "https://rentnest-sooty.vercel.app/api".
 *
 * Read lazily (not at import time) so a missing variable produces a clear
 * error at the point of use instead of breaking unrelated pages.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.API_BASE_URL?.trim();
  if (!raw) {
    throw new Error(
      "API_BASE_URL is not set. Add API_BASE_URL=https://rentnest-sooty.vercel.app to .env.local " +
        "(and to the Vercel project's environment variables for deployments).",
    );
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`API_BASE_URL must be an absolute URL, received "${raw}".`);
  }

  // Every backend route lives under /api (see the Postman collection).
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}/api`;
}
