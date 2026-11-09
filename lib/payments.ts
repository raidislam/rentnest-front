// Small payment helpers shared by the pay page and the payment return pages. Safe on server and client.

/** SSLCommerz transaction/validation ids (e.g. "RENT-1731234567890-42"): letters, digits, "-" and "_" only. */
const GATEWAY_ID = /^[A-Za-z0-9_-]{1,100}$/;

/** A query/form value if it's a well-formed gateway id, otherwise null (never passed to the backend). */
export function readGatewayId(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v && GATEWAY_ID.test(v) ? v : null;
}

/**
 * True only for HTTPS URLs on sslcommerz.com (sandbox or live). The pay button redirects only to
 * the backend-provided paymentUrl, and only if it passes this check — never to an arbitrary URL.
 */
export function isSslcommerzUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && (hostname === "sslcommerz.com" || hostname.endsWith(".sslcommerz.com"));
  } catch {
    return false;
  }
}
