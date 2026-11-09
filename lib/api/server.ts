// Server-side Axios clients. Import only from Server Components, Route
// Handlers and Server Functions — `server-only` fails the build otherwise.
//
//   const properties = await listProperties(getPublicServerApi(), { location: "dhaka" });
//   const rentals = await listMyRentalRequests(await getServerApi());

import "server-only";
import type { AxiosInstance } from "axios";
import { getSessionToken } from "@/lib/auth/session";
import { getApiBaseUrl } from "./config";
import { createApiClient } from "./http";

/**
 * Client for public endpoints. Reads no cookies.
 *
 * Note: Axios doesn't go through Next's fetch cache, so a page that only uses
 * this client would be prerendered once at build time. Such pages must call
 * `await connection()` (from "next/server") before fetching.
 */
export function getPublicServerApi(): AxiosInstance {
  return createApiClient({ baseURL: getApiBaseUrl() });
}

/** Client that sends the session cookie's JWT as a Bearer token (no token when signed out). */
export async function getServerApi(): Promise<AxiosInstance> {
  return createApiClient({ baseURL: getApiBaseUrl(), token: await getSessionToken() });
}
