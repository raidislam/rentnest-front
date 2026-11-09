// Tenant rental request endpoints (Postman folder "Tenant"). Require a TENANT token.

import type { AxiosInstance } from "axios";
import type { CreatedResourceDTO, CreateRentalBody, RentalDTO } from "../dto";
import { unwrap } from "../http";
import { toRentalRequest, type MappedRentalRequest } from "../mappers";

const rentalPath = (id: string) => `/rentals/${encodeURIComponent(id)}`;

/** POST /api/rentals — build `message` with buildRentalMessage(). Returns the new request's id. */
export async function createRentalRequest(api: AxiosInstance, body: CreateRentalBody): Promise<CreatedResourceDTO> {
  const data = await unwrap<CreatedResourceDTO>(api.post("/rentals", body));
  return { id: data.id };
}

/** GET /api/rentals — the signed-in tenant's requests. */
export async function listMyRentalRequests(api: AxiosInstance): Promise<MappedRentalRequest[]> {
  return (await unwrap<RentalDTO[]>(api.get("/rentals"))).map(toRentalRequest);
}

/** GET /api/rentals/:id — with property and payment. Another tenant's request -> 403. */
export async function getRentalRequest(api: AxiosInstance, id: string): Promise<MappedRentalRequest> {
  return toRentalRequest(await unwrap<RentalDTO>(api.get(rentalPath(id))));
}

/** PATCH /api/rentals/:id/complete — ACTIVE (paid) -> COMPLETED. Enables reviews. */
export async function completeRental(api: AxiosInstance, id: string): Promise<void> {
  await unwrap<unknown>(api.patch(`${rentalPath(id)}/complete`));
}
