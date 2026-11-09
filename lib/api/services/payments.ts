// Tenant payment endpoints (Postman folder "Tenant"). SSLCommerz only.
// The SSLCommerz callbacks (/api/payments/success|fail|cancel|ipn) are called
// by SSLCommerz itself, never by the frontend, so they are not wrapped here.

import type { AxiosInstance } from "axios";
import type { ConfirmPaymentBody, CreatePaymentBody, CreatePaymentResultDTO, PaymentDTO } from "../dto";
import { unwrap } from "../http";
import { toPayment, type MappedPayment } from "../mappers";

/**
 * POST /api/payments/create — for an APPROVED request. Redirect the browser to
 * the returned `paymentUrl`. A FAILED/PENDING payment can be retried; a COMPLETED one -> 409.
 */
export async function createPayment(api: AxiosInstance, body: CreatePaymentBody): Promise<CreatePaymentResultDTO> {
  const data = await unwrap<CreatePaymentResultDTO>(api.post("/payments/create", body));
  return { paymentId: data.paymentId, transactionId: data.transactionId, paymentUrl: data.paymentUrl };
}

/** POST /api/payments/confirm — manual confirmation with SSLCommerz tran_id and val_id. */
export async function confirmPayment(api: AxiosInstance, body: ConfirmPaymentBody): Promise<void> {
  await unwrap<unknown>(api.post("/payments/confirm", body));
}

/** GET /api/payments — the signed-in tenant's payments. */
export async function listMyPayments(api: AxiosInstance): Promise<MappedPayment[]> {
  return (await unwrap<PaymentDTO[]>(api.get("/payments"))).map(toPayment);
}

/** GET /api/payments/:id — with rental request and property details. */
export async function getPayment(api: AxiosInstance, id: string): Promise<MappedPayment> {
  return toPayment(await unwrap<PaymentDTO>(api.get(`/payments/${encodeURIComponent(id)}`)));
}
