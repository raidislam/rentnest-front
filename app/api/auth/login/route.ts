// POST /api/auth/login  { email, password, remember? }
// Logs in with the backend, stores the JWT in an HttpOnly cookie and returns
// the user ({ id, name, email, role }). The token itself never reaches the browser.

import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { createApiClient } from "@/lib/api/http";
import { jsonFromError, jsonOk, readJsonBody, rejectCrossSite } from "@/lib/api/route-utils";
import { getPublicServerApi } from "@/lib/api/server";
import { getMe, login } from "@/lib/api/services/auth";
import { setSessionCookies } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;

  const body = await readJsonBody(request);
  if (body instanceof Response) return body;

  try {
    // Only the documented fields are forwarded; the backend validates them.
    const { token } = await login(getPublicServerApi(), {
      email: body.email as string,
      password: body.password as string,
    });
    // The login response only documents `token`, so the role comes from /auth/me.
    const user = await getMe(createApiClient({ baseURL: getApiBaseUrl(), token }));
    await setSessionCookies(token, user.role, { remember: body.remember !== false });
    return jsonOk(user, "Logged in successfully");
  } catch (error) {
    // Backend errors pass through: 400 validation, 401 wrong credentials, 403 banned.
    return jsonFromError(error);
  }
}
