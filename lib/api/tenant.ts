// Server-side data loading for the tenant dashboard pages. Server-only.
//
// - 401 (session expired/invalid) -> redirect to login.
// - A request that isn't the tenant's (403), doesn't exist (404) or has a
//   malformed id (400) -> null, so pages show "not found" and never reveal
//   another user's data.
// - Anything else is thrown to the dashboard's error boundary.

import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { toApiError } from "./errors";
import type { MappedPayment, MappedRentalRequest } from "./mappers";
import { getServerApi } from "./server";
import { confirmPayment, getPayment, listMyPayments } from "./services/payments";
import { attachMissingProperties, getRentalRequest, listMyRentalRequests } from "./services/rentals";

function handleAuthError(error: unknown): never {
  unstable_rethrow(error);
  const apiError = toApiError(error);
  if (apiError.isUnauthorized) redirect("/auth/login");
  throw apiError;
}

const byNewest = (a: { createdAt?: string }, b: { createdAt?: string }) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "");

/** GET /api/rentals, newest first, with properties filled in where the response omitted them. */
export async function getMyRentals(): Promise<MappedRentalRequest[]> {
  try {
    const api = await getServerApi();
    return (await attachMissingProperties(api, await listMyRentalRequests(api))).sort(byNewest);
  } catch (error) {
    handleAuthError(error);
  }
}

/** GET /api/rentals/:id, or null if it isn't this tenant's request or doesn't exist. */
export async function getMyRental(id: string): Promise<MappedRentalRequest | null> {
  try {
    const api = await getServerApi();
    const [rental] = await attachMissingProperties(api, [await getRentalRequest(api, id)]);
    return rental;
  } catch (error) {
    unstable_rethrow(error);
    const status = toApiError(error).status;
    if (status === 403 || status === 404 || status === 400) return null;
    handleAuthError(error);
  }
}

/** GET /api/payments/:id, or null if it isn't this tenant's payment (403), doesn't exist (404) or the id is malformed (400). */
export async function getMyPayment(id: string): Promise<MappedPayment | null> {
  try {
    return await getPayment(await getServerApi(), id);
  } catch (error) {
    unstable_rethrow(error);
    const status = toApiError(error).status;
    if (status === 403 || status === 404 || status === 400) return null;
    handleAuthError(error);
  }
}

/** The tenant's payment with this SSLCommerz transaction id, from GET /api/payments (null if none). */
export async function findMyPaymentByTransaction(transactionId: string): Promise<MappedPayment | null> {
  const payments = await getMyPayments();
  return payments.find((p) => p.transactionId === transactionId) ?? null;
}

export type ConfirmOutcome =
  | { ok: true; payment: MappedPayment | null }
  | { ok: false; status: number | null; message: string };

/**
 * POST /api/payments/confirm with exactly { tran_id, val_id }. The backend validates val_id with
 * SSLCommerz before marking anything as paid, so its answer is the only source of truth.
 */
export async function confirmMyPayment(tranId: string, valId: string): Promise<ConfirmOutcome> {
  try {
    return { ok: true, payment: await confirmPayment(await getServerApi(), { tran_id: tranId, val_id: valId }) };
  } catch (error) {
    unstable_rethrow(error);
    const apiError = toApiError(error);
    if (apiError.isUnauthorized) redirect("/auth/login");
    return { ok: false, status: apiError.status, message: apiError.message };
  }
}

/** GET /api/payments (the tenant's payment history, read-only), newest first. */
export async function getMyPayments(): Promise<MappedPayment[]> {
  try {
    return (await listMyPayments(await getServerApi())).sort(byNewest);
  } catch (error) {
    handleAuthError(error);
  }
}
