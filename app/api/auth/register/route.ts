// POST /api/auth/register  { name, email, password, role }
// Creates the account with the backend, then logs the new user in
// automatically (same credentials) and stores the session cookie.
//
// Responds 201 with { user } — or { user: null } if the account was created
// but the automatic login failed, so the UI can ask the user to log in.

import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";
import type { RegisterBody } from "@/lib/api/dto";
import { createApiClient } from "@/lib/api/http";
import type { SessionUser } from "@/lib/api/mappers";
import { jsonFromError, jsonOk, readJsonBody, rejectCrossSite } from "@/lib/api/route-utils";
import { getPublicServerApi } from "@/lib/api/server";
import { getMe, login, register } from "@/lib/api/services/auth";
import { setSessionCookies } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;

  const body = await readJsonBody(request);
  if (body instanceof Response) return body;

  // Only the documented fields are forwarded; the backend validates them
  // (and rejects any role other than TENANT or LANDLORD).
  const input: RegisterBody = {
    name: body.name as string,
    email: body.email as string,
    password: body.password as string,
    role: body.role as RegisterBody["role"],
  };

  const api = getPublicServerApi();
  try {
    await register(api, input);
  } catch (error) {
    return jsonFromError(error);
  }

  let user: SessionUser | null = null;
  try {
    const { token } = await login(api, { email: input.email, password: input.password });
    user = await getMe(createApiClient({ baseURL: getApiBaseUrl(), token }));
    await setSessionCookies(token, user.role, { remember: true });
  } catch (error) {
    console.error("[auth] account created but automatic login failed:", error);
    user = null;
  }

  return jsonOk({ user }, "Account created successfully", 201);
}
