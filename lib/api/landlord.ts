// Server-side data loading for the landlord dashboard pages. Server-only.
// 401 -> login; other failures go to the dashboard's error boundary.

import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { toApiError } from "./errors";
import { withProperty, type MappedCategory, type MappedProperty, type MappedRentalRequest, type MappedReview } from "./mappers";
import { getPublicServerApi, getServerApi } from "./server";
import { listCategories } from "./services/categories";
import { listMyProperties, listMyReviews, listRentalRequests } from "./services/landlord";

function rethrow(error: unknown): never {
  unstable_rethrow(error);
  const apiError = toApiError(error);
  if (apiError.isUnauthorized) redirect("/auth/login");
  throw apiError;
}

const byNewest = (a: { createdAt?: string }, b: { createdAt?: string }) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "");

/** GET /api/landlord/properties, newest first. */
export async function getMyProperties(): Promise<MappedProperty[]> {
  try {
    return (await listMyProperties(await getServerApi())).sort(byNewest);
  } catch (error) {
    rethrow(error);
  }
}

/**
 * GET /api/landlord/properties + GET /api/landlord/requests. Requests whose
 * response omits the property get it from the landlord's own list (by id).
 */
export async function getPropertiesAndRequests(): Promise<{ properties: MappedProperty[]; requests: MappedRentalRequest[] }> {
  try {
    const api = await getServerApi();
    const [properties, requests] = await Promise.all([listMyProperties(api), listRentalRequests(api)]);
    const byId = new Map(properties.map((p) => [p.id, p]));
    return {
      properties: properties.sort(byNewest),
      requests: requests.map((r) => (r.property ? r : withProperty(r, byId.get(r.propertyId)))).sort(byNewest),
    };
  } catch (error) {
    rethrow(error);
  }
}

/** GET /api/landlord/reviews, newest first; null if the reviews couldn't be loaded (the dashboard still renders). */
export async function getMyReviews(): Promise<MappedReview[] | null> {
  try {
    return (await listMyReviews(await getServerApi())).sort(byNewest);
  } catch (error) {
    unstable_rethrow(error);
    if (toApiError(error).isUnauthorized) redirect("/auth/login");
    console.error("[landlord] reviews could not be loaded:", toApiError(error).message);
    return null;
  }
}

/** GET /api/categories (public) for the property form. */
export async function getCategories(): Promise<MappedCategory[]> {
  try {
    return await listCategories(getPublicServerApi());
  } catch (error) {
    rethrow(error);
  }
}
