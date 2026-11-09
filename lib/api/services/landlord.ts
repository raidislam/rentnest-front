// Landlord-only endpoints (Postman folder "Landlord"). Require a LANDLORD token.

import type { AxiosInstance } from "axios";
import type {
  CreatedResourceDTO,
  CreatePropertyBody,
  DecideRentalBody,
  RentalDTO,
  ReviewDTO,
  UnverifiedPropertyDTO,
  UpdatePropertyBody,
} from "../dto";
import { unwrap, unwrapVoid } from "../http";
import {
  mapList,
  toProperty,
  toRentalRequest,
  toReview,
  type MappedProperty,
  type MappedRentalRequest,
  type MappedReview,
} from "../mappers";

const propertyPath = (id: string) => `/landlord/properties/${encodeURIComponent(id)}`;

/** GET /api/landlord/properties — only the signed-in landlord's properties. */
export async function listMyProperties(api: AxiosInstance): Promise<MappedProperty[]> {
  return mapList(await unwrap<UnverifiedPropertyDTO[]>(api.get("/landlord/properties")), toProperty, "property");
}

/** POST /api/landlord/properties — categoryId must exist. Returns the new property's id. */
export async function createProperty(api: AxiosInstance, body: CreatePropertyBody): Promise<CreatedResourceDTO> {
  const data = await unwrap<CreatedResourceDTO>(api.post("/landlord/properties", body));
  return { id: data.id };
}

/** PUT /api/landlord/properties/:id — all fields optional. Another landlord's property -> 403. */
export async function updateProperty(api: AxiosInstance, id: string, body: UpdatePropertyBody): Promise<void> {
  await unwrapVoid(api.put(propertyPath(id), body));
}

/** PUT /api/landlord/properties/:id with { availability }. Unavailable properties are hidden from public search. */
export async function setPropertyAvailability(api: AxiosInstance, id: string, availability: boolean): Promise<void> {
  await updateProperty(api, id, { availability });
}

/** DELETE /api/landlord/properties/:id — 409 if the property has rental requests. */
export async function deleteProperty(api: AxiosInstance, id: string): Promise<void> {
  await unwrapVoid(api.delete(propertyPath(id)));
}

/** GET /api/landlord/requests — requests for the landlord's properties, with payment info. */
export async function listRentalRequests(api: AxiosInstance): Promise<MappedRentalRequest[]> {
  return mapList(await unwrap<RentalDTO[]>(api.get("/landlord/requests")), toRentalRequest, "rental request");
}

/** PATCH /api/landlord/requests/:id — only PENDING requests can be approved or rejected. */
export async function decideRentalRequest(
  api: AxiosInstance,
  id: string,
  status: DecideRentalBody["status"],
): Promise<void> {
  const body: DecideRentalBody = { status };
  await unwrapVoid(api.patch(`/landlord/requests/${encodeURIComponent(id)}`, body));
}

/** GET /api/landlord/reviews — reviews for the landlord's properties. */
export async function listMyReviews(api: AxiosInstance): Promise<MappedReview[]> {
  return mapList(await unwrap<ReviewDTO[]>(api.get("/landlord/reviews")), toReview, "review");
}
