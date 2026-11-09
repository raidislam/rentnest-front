// Tenant rental request endpoints (Postman folder "Tenant"). Require a TENANT token.

import type { AxiosInstance } from "axios";
import type { CreatedResourceDTO, CreateRentalBody, RentalDTO } from "../dto";
import { unwrap, unwrapVoid } from "../http";
import { mapList, toRentalRequest, withProperty, type MappedRentalRequest } from "../mappers";
import { getProperty } from "./properties";

const rentalPath = (id: string) => `/rentals/${encodeURIComponent(id)}`;

/** POST /api/rentals — build `message` with buildRentalMessage(). Returns the new request's id. */
export async function createRentalRequest(api: AxiosInstance, body: CreateRentalBody): Promise<CreatedResourceDTO> {
  const data = await unwrap<CreatedResourceDTO>(api.post("/rentals", body));
  return { id: data.id };
}

/** GET /api/rentals — the signed-in tenant's requests. */
export async function listMyRentalRequests(api: AxiosInstance): Promise<MappedRentalRequest[]> {
  return mapList(await unwrap<RentalDTO[]>(api.get("/rentals")), toRentalRequest, "rental request");
}

/** GET /api/rentals/:id — with property and payment. Another tenant's request -> 403. */
export async function getRentalRequest(api: AxiosInstance, id: string): Promise<MappedRentalRequest> {
  return toRentalRequest(await unwrap<RentalDTO>(api.get(rentalPath(id))));
}

/**
 * Fills in `property` for rentals whose response didn't embed it, using the
 * public GET /api/properties/:id (one request per distinct property). A property
 * that can't be loaded stays undefined and the UI shows a fallback.
 */
export async function attachMissingProperties(api: AxiosInstance, rentals: MappedRentalRequest[]): Promise<MappedRentalRequest[]> {
  const missing = [...new Set(rentals.filter((r) => !r.property).map((r) => r.propertyId))];
  if (missing.length === 0) return rentals;
  const loaded = new Map(
    await Promise.all(missing.map(async (id) => [id, await getProperty(api, id).catch(() => undefined)] as const)),
  );
  return rentals.map((r) => (r.property ? r : withProperty(r, loaded.get(r.propertyId))));
}

/** PATCH /api/rentals/:id/complete — ACTIVE (paid) -> COMPLETED. Enables reviews. */
export async function completeRental(api: AxiosInstance, id: string): Promise<void> {
  await unwrapVoid(api.patch(`${rentalPath(id)}/complete`));
}
