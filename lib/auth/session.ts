// Server-only session access (the Data Access Layer for auth).
//
// The JWT lives in an HttpOnly cookie set by the login Route Handler (Step 03),
// so only server code can read it. Client Components receive the user as props
// from a Server Component parent instead of importing this file.
//
// Per the Next.js 16 auth guide, call requireUser() in each protected page as
// well as its layout: layouts don't re-render on client-side navigation.

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { getApiBaseUrl, ROLE_COOKIE, SESSION_COOKIE } from "@/lib/api/config";
import { toApiError } from "@/lib/api/errors";
import { createApiClient } from "@/lib/api/http";
import type { SessionUser } from "@/lib/api/mappers";
import { getMe } from "@/lib/api/services/auth";
import type { Role } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";
import { readJwtExpiry } from "./jwt";

/** Used when the token has no readable `exp` claim. */
const DEFAULT_SESSION_DAYS = 7;

/**
 * Stores the session in HttpOnly cookies. Call only from Route Handlers or
 * Server Functions (Server Components can't set cookies).
 *
 * remember = true  -> cookies last until the JWT expires (or 7 days if unknown).
 * remember = false -> browser-session cookies, cleared when the browser closes.
 */
export async function setSessionCookies(token: string, role: Role, { remember }: { remember: boolean }) {
  const expires = remember
    ? (readJwtExpiry(token) ?? new Date(Date.now() + DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000))
    : undefined;
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, options);
  // Read by proxy.ts for quick redirects only; never trusted for authorization.
  cookieStore.set(ROLE_COOKIE, role, options);
}

/** Removes the session cookies. Route Handlers / Server Functions only. */
export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}

/** The JWT from the session cookie, or null when signed out. */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value || null;
}

/**
 * The signed-in user from GET /api/auth/me, or null when signed out, the token
 * has expired (401) or the account is banned (403).
 * Wrapped in React cache(), so it hits the backend at most once per request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    return await getMe(createApiClient({ baseURL: getApiBaseUrl(), token }));
  } catch (error) {
    unstable_rethrow(error); // never swallow Next.js internal errors (dynamic rendering, redirects)
    const apiError = toApiError(error);
    if (apiError.isUnauthorized || apiError.isForbidden) return null;
    throw apiError;
  }
});

/**
 * Like getCurrentUser(), but returns null instead of throwing when the backend
 * can't be reached. For UI that should degrade to the signed-out view (the
 * public navbar, the login page) rather than fail the whole page.
 */
export async function getOptionalUser(): Promise<SessionUser | null> {
  try {
    return await getCurrentUser();
  } catch (error) {
    // cookies() signals dynamic rendering by throwing during prerender; let Next.js handle it.
    unstable_rethrow(error);
    console.error("[auth] could not load the current user:", toApiError(error).message);
    return null;
  }
}

/**
 * Returns the signed-in user or redirects:
 * - signed out / invalid session -> /auth/login
 * - wrong role for this area      -> the user's own dashboard
 */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (role && user.role !== role) redirect(dashboardPath(user.role));
  return user;
}
