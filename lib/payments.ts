// Small payment helpers shared by the pay page and the payment return pages. Safe on server and client.

/** SSLCommerz transaction/validation ids (e.g. "RENT-1731234567890-42"): letters, digits, "-" and "_" only. */
const GATEWAY_ID = /^[A-Za-z0-9_-]{1,100}$/;

/** A query/form value if it's a well-formed gateway id, otherwise null (never passed to the backend). */
export function readGatewayId(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v && GATEWAY_ID.test(v) ? v : null;
}

export type PaymentGatewayMode = "sandbox" | "live";

/**
 * Which SSLCommerz gateway the pay button may redirect to. Set NEXT_PUBLIC_SSLCOMMERZ_MODE=live
 * only for a production build whose backend uses LIVE SSLCommerz credentials; any other value
 * (or none) means sandbox, so test builds can never send users to the real payment gateway.
 * Public, non-secret setting; inlined at build time.
 */
export const PAYMENT_GATEWAY_MODE: PaymentGatewayMode = process.env.NEXT_PUBLIC_SSLCOMMERZ_MODE === "live" ? "live" : "sandbox";

/** The only gateway host allowed in each mode (the hosts the backend talks to). */
export const GATEWAY_HOSTS: Record<PaymentGatewayMode, string> = {
  sandbox: "sandbox.sslcommerz.com",
  live: "securepay.sslcommerz.com",
};

/**
 * True only for an HTTPS URL on the SSLCommerz host of the configured mode. The pay button
 * redirects only to the backend-provided paymentUrl, and only if it passes this check.
 */
export function isSslcommerzUrl(url: unknown, mode: PaymentGatewayMode = PAYMENT_GATEWAY_MODE): url is string {
  if (typeof url !== "string") return false;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname === GATEWAY_HOSTS[mode];
  } catch {
    return false;
  }
}
