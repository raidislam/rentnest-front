// Auth endpoints (Postman folder "Auth").
// login() returns the raw token and is meant to be called only from the
// login Route Handler (Step 03), which stores it in an HttpOnly cookie.

import type { AxiosInstance } from "axios";
import type { LoginBody, LoginResultDTO, RegisterBody, UpdateProfileBody, UserDTO } from "../dto";
import { unwrap, unwrapVoid } from "../http";
import { toSessionUser, type SessionUser } from "../mappers";

/** POST /api/auth/login (no auth). Banned users get 403. */
export async function login(api: AxiosInstance, body: LoginBody): Promise<LoginResultDTO> {
  const data = await unwrap<LoginResultDTO>(api.post("/auth/login", body));
  return { token: data.token };
}

/** POST /api/auth/register (no auth). Role must be TENANT or LANDLORD. The response body is not used (unverified). */
export async function register(api: AxiosInstance, body: RegisterBody): Promise<void> {
  await unwrapVoid(api.post("/auth/register", body));
}

/** GET /api/auth/me (Bearer, any role). */
export async function getMe(api: AxiosInstance): Promise<SessionUser> {
  return toSessionUser(await unwrap<UserDTO>(api.get("/auth/me")));
}

/** PATCH /api/auth/me (Bearer). Only `name` may be sent. */
export async function updateProfile(api: AxiosInstance, body: UpdateProfileBody): Promise<SessionUser> {
  return toSessionUser(await unwrap<UserDTO>(api.patch("/auth/me", body)));
}
