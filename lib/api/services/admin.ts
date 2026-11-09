// Admin-only endpoints (Postman folder "Admin"). Require an ADMIN token.
// Property moderation has no backend endpoint; admin property views are read-only.

import type { AxiosInstance } from "axios";
import type { CategoryBody, CreatedResourceDTO, RentalDTO, UnverifiedPropertyDTO, UserDTO } from "../dto";
import { unwrap } from "../http";
import {
  toProperty,
  toRentalRequest,
  toUser,
  toUserStatusBody,
  type MappedProperty,
  type MappedRentalRequest,
  type MappedUser,
} from "../mappers";
import type { UserStatus } from "@/lib/types";

/** GET /api/admin/users — all users with role and status. */
export async function listUsers(api: AxiosInstance): Promise<MappedUser[]> {
  return (await unwrap<UserDTO[]>(api.get("/admin/users"))).map(toUser);
}

/** PATCH /api/admin/users/:id — ban (BANNED) or unban (ACTIVE). Admins can't ban themselves. */
export async function setUserStatus(api: AxiosInstance, id: string, status: UserStatus): Promise<void> {
  await unwrap<unknown>(api.patch(`/admin/users/${encodeURIComponent(id)}`, toUserStatusBody(status)));
}

/** GET /api/admin/properties — every property, including unavailable ones, with landlord and category. */
export async function listAllProperties(api: AxiosInstance): Promise<MappedProperty[]> {
  return (await unwrap<UnverifiedPropertyDTO[]>(api.get("/admin/properties"))).map(toProperty);
}

/** GET /api/admin/rentals — every rental request with tenant, property and payment. */
export async function listAllRentalRequests(api: AxiosInstance): Promise<MappedRentalRequest[]> {
  return (await unwrap<RentalDTO[]>(api.get("/admin/rentals"))).map(toRentalRequest);
}

/** POST /api/admin/categories — duplicate name -> 409. */
export async function createCategory(api: AxiosInstance, body: CategoryBody): Promise<CreatedResourceDTO> {
  const data = await unwrap<CreatedResourceDTO>(api.post("/admin/categories", body));
  return { id: data.id };
}

/** PUT /api/admin/categories/:id — unknown id -> 404, duplicate name -> 409. */
export async function updateCategory(api: AxiosInstance, id: string, body: CategoryBody): Promise<void> {
  await unwrap<unknown>(api.put(`/admin/categories/${encodeURIComponent(id)}`, body));
}

/** DELETE /api/admin/categories/:id — a category that still has properties -> 409. */
export async function deleteCategory(api: AxiosInstance, id: string): Promise<void> {
  await unwrap<unknown>(api.delete(`/admin/categories/${encodeURIComponent(id)}`));
}
