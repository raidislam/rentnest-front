// Where to send a user after login. Safe on server and client.

import type { Role } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";

const ROLES: readonly Role[] = ["TENANT", "LANDLORD", "ADMIN"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** True when `pathname` is the role's dashboard or a page inside it. */
export function isInDashboard(pathname: string, role: Role): boolean {
  const home = dashboardPath(role);
  return pathname === home || pathname.startsWith(`${home}/`);
}

/**
 * The `next` param if it's a safe same-site path the user may open, otherwise
 * the user's dashboard. Rejects absolute and protocol-relative URLs
 * ("https://…", "//evil.com") and other roles' dashboards.
 */
export function postLoginPath(next: string | null | undefined, role: Role): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return dashboardPath(role);
  const pathname = next.split(/[?#]/)[0];
  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/")) return dashboardPath(role);
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return isInDashboard(pathname, role) ? next : dashboardPath(role);
  }
  return next;
}
