// Server-side data loading for the admin dashboard pages. Server-only.
// 401 -> login; other failures go to the dashboard's error boundary.

import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { toApiError } from "./errors";
import type { MappedCategory, MappedProperty, MappedRentalRequest, MappedUser } from "./mappers";
import { getPublicServerApi, getServerApi } from "./server";
import { listAllProperties, listAllRentalRequests, listUsers } from "./services/admin";
import { listCategories } from "./services/categories";

async function load<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    unstable_rethrow(error);
    const apiError = toApiError(error);
    if (apiError.isUnauthorized) redirect("/auth/login");
    throw apiError;
  }
}

/** GET /api/admin/users */
export const getAdminUsers = (): Promise<MappedUser[]> => load(async () => listUsers(await getServerApi()));

/** GET /api/admin/properties (all properties, including unavailable ones) */
export const getAdminProperties = (): Promise<MappedProperty[]> => load(async () => listAllProperties(await getServerApi()));

/** GET /api/admin/rentals */
export const getAdminRentals = (): Promise<MappedRentalRequest[]> => load(async () => listAllRentalRequests(await getServerApi()));

/**
 * GET /api/categories — the documented (public) category list. There is no
 * GET /api/admin/categories endpoint; admins use POST/PUT/DELETE /api/admin/categories to manage them.
 */
export const getAllCategories = (): Promise<MappedCategory[]> => load(() => listCategories(getPublicServerApi()));
