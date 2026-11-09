// Axios client for Client Components. Calls the same-origin pass-through
// (/api/backend/*), which attaches the JWT from the HttpOnly cookie on the
// server — browser code never reads or stores the token.
//
//   import { browserApi } from "@/lib/api/browser";
//   await createRentalRequest(browserApi, { propertyId, message });
//
// Use the service functions in lib/api/services with this client, exactly as
// server code uses getServerApi().

import "client-only";
import { ApiError } from "./errors";
import { createApiClient } from "./http";

export const browserApi = createApiClient({ baseURL: "/api/backend" });

// 401 = no session or an expired/invalid token: send the user to log in and come back.
// 403 is NOT handled here — it also means "wrong role" or "not your record", which
// callers show as an error message instead of logging the user out.
browserApi.interceptors.response.use(undefined, (error: unknown) => {
  if (error instanceof ApiError && error.isUnauthorized && typeof window !== "undefined") {
    const next = `${window.location.pathname}${window.location.search}`;
    // Module-level interceptor (no React router here); a full load also re-runs proxy.ts and the session check.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/auth/login?next=${encodeURIComponent(next)}`);
  }
  return Promise.reject(error);
});
