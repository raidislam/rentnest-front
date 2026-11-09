// POST /api/auth/logout
// Clears the session cookies. The backend has no logout endpoint, so the JWT
// itself stays valid until it expires — but the browser can no longer send it.

import type { NextRequest } from "next/server";
import { jsonOk, rejectCrossSite } from "@/lib/api/route-utils";
import { clearSessionCookies } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;

  await clearSessionCookies();
  return jsonOk(null, "Logged out successfully");
}
