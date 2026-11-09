// Reads the standard `exp` claim from a JWT without verifying it.
// Used only for cookie lifetimes and optimistic checks in proxy.ts — the
// backend verifies every token on every request. Safe on server and client.

/** Expiry as a Date, or null if the token has no readable `exp` claim. */
export function readJwtExpiry(token: string): Date | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const { exp } = JSON.parse(atob(base64)) as { exp?: unknown };
    return typeof exp === "number" ? new Date(exp * 1000) : null;
  } catch {
    return null;
  }
}

/** True only when the token has an `exp` claim in the past. Tokens without one are left to the backend. */
export function isJwtExpired(token: string, now = Date.now()): boolean {
  const expiry = readJwtExpiry(token);
  return expiry !== null && expiry.getTime() <= now;
}
