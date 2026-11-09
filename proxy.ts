// Optimistic route protection for /dashboard (Next.js 16 "Proxy", formerly Middleware).
//
// Reads cookies only — no backend calls — because Proxy runs on every matching
// request, including prefetches. The real checks happen in requireUser()
// (lib/auth/session.ts) and in the backend, which verifies every token.

import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/api/config";
import { isJwtExpired } from "@/lib/auth/jwt";
import { isInDashboard, isRole } from "@/lib/auth/redirects";
import { dashboardPath } from "@/lib/utils";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  // Signed out, or the token has visibly expired: go to login and come back afterwards.
  if (!token || isJwtExpired(token) || !isRole(role)) {
    const loginUrl = new URL("/auth/login", request.url);
    if (pathname !== "/dashboard") loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete(SESSION_COOKIE);
      response.cookies.delete(ROLE_COOKIE);
    }
    return response;
  }

  // /dashboard itself, or another role's area: go to the user's own dashboard.
  if (!isInDashboard(pathname, role)) {
    return NextResponse.redirect(new URL(dashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
