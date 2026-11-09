// Browser-side calls to our own auth Route Handlers (app/api/auth/*).
// They answer with the backend's envelope, so unwrap()/ApiError work as usual.

import type { LoginBody, RegisterBody } from "./dto";
import { createApiClient, unwrap } from "./http";
import type { SessionUser } from "./mappers";

const authApi = createApiClient({ baseURL: "/api/auth" });

/** Logs in and sets the HttpOnly session cookie. `remember: false` = cookie ends with the browser session. */
export function loginRequest(body: LoginBody & { remember: boolean }): Promise<SessionUser> {
  return unwrap<SessionUser>(authApi.post("/login", body));
}

/** Registers, then logs in automatically. `user` is null if the account exists but the automatic login failed. */
export function registerRequest(body: RegisterBody): Promise<{ user: SessionUser | null }> {
  return unwrap<{ user: SessionUser | null }>(authApi.post("/register", body));
}

/** Clears the session cookies. */
export async function logoutRequest(): Promise<void> {
  await unwrap<null>(authApi.post("/logout"));
}
