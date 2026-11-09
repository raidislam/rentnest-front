// Public property endpoints (Postman folder "Public").

import type { AxiosInstance } from "axios";
import type { PropertyDetailsDTO, PropertyDTO, PropertyQueryParams } from "../dto";
import { unwrap } from "../http";
import { toProperty, toPropertyDetails, type MappedProperty, type PropertyDetails } from "../mappers";

/**
 * GET /api/properties (no auth). Returns available properties only.
 * Supported filters: location (partial), minPrice, maxPrice, propertyType (exact), amenity (single value).
 * Not paginated. Undefined params are omitted from the query string by Axios.
 */
export async function listProperties(api: AxiosInstance, params: PropertyQueryParams = {}): Promise<MappedProperty[]> {
  return (await unwrap<PropertyDTO[]>(api.get("/properties", { params }))).map(toProperty);
}

/** GET /api/properties/:id (no auth). Invalid UUID -> 400, unknown id -> 404. */
export async function getProperty(api: AxiosInstance, id: string): Promise<PropertyDetails> {
  return toPropertyDetails(await unwrap<PropertyDetailsDTO>(api.get(`/properties/${encodeURIComponent(id)}`)));
}
