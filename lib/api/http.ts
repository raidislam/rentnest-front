// Shared Axios setup. Safe to import from Server and Client Components: it
// reads no environment variables and no cookies — callers pass the base URL
// and (optionally) the token. See lib/api/server.ts for the server-side
// clients. The browser client is added with the same-origin pass-through in Step 04.

import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { ApiEnvelopeDTO } from "./dto";
import { ApiError, apiErrorFromBody, isApiFailure, toApiError } from "./errors";

/** Generous because the backend runs on Vercel and can cold-start. */
export const REQUEST_TIMEOUT_MS = 20_000;

export interface ApiClientOptions {
  baseURL: string;
  /** JWT to send as `Authorization: Bearer <token>`. Only ever passed on the server. */
  token?: string | null;
}

export function createApiClient({ baseURL, token }: ApiClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Every rejected request surfaces as an ApiError, never a raw AxiosError.
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}

/**
 * Awaits an Axios request and returns the `data` field of the backend envelope
 * `{ success, message, data }`.
 *
 *   const properties = await unwrap<PropertyDTO[]>(api.get("/properties"));
 *
 * Throws ApiError when the body says `success: false` or isn't an envelope at all.
 */
export async function unwrap<T>(request: Promise<AxiosResponse<unknown>>): Promise<T> {
  let response: AxiosResponse<unknown>;
  try {
    response = await request;
  } catch (error) {
    throw toApiError(error);
  }

  const body = response.data as ApiEnvelopeDTO<T> | undefined;

  if (isApiFailure(body)) throw apiErrorFromBody(body, response.status);

  if (typeof body !== "object" || body === null || body.success !== true || !("data" in body)) {
    throw new ApiError("The server returned data in an unexpected format.", {
      kind: "invalid_response",
      status: response.status,
    });
  }

  return body.data;
}
