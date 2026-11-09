// Tenant payment endpoints (Postman folder "Tenant"). SSLCommerz only.
// The SSLCommerz callbacks (/api/payments/success|fail|cancel|ipn) are called
// by SSLCommerz itself, never by the frontend, so they are not wrapped here.

import type { AxiosInstance } from "axios";
import type { ConfirmPaymentBody, CreatePaymentBody, CreatePaymentResultDTO, PaymentDTO } from "../dto";
import { unwrap } from "../http";
import { mapList, toPayment, type MappedPayment } from "../mappers";

/**
 * POST /api/payments/create — for an APPROVED request. Redirect the browser to
 * the returned `paymentUrl`. A FAILED/PENDING payment can be retried; a COMPLETED one -> 409.
 */
export async function createPayment(api: AxiosInstance, body: CreatePaymentBody): Promise<CreatePaymentResultDTO> {
  const data = await unwrap<CreatePaymentResultDTO>(api.post("/payments/create", body));
  return { paymentId: data.paymentId, transactionId: data.transactionId, amount: data.amount, paymentUrl: data.paymentUrl };
}

/**
 * POST /api/payments/confirm — the backend validates val_id with SSLCommerz (status, tran_id,
 * amount, currency) before marking the payment COMPLETED and the rental ACTIVE.
 * Returns the backend's payment record (source-verified: the updated payment).
 */
export async function confirmPayment(api: AxiosInstance, body: ConfirmPaymentBody): Promise<MappedPayment | null> {
  const data = await unwrap<PaymentDTO | null>(api.post("/payments/confirm", body));
  return data ? toPayment(data) : null;
}

/** GET /api/payments — the signed-in tenant's payments. */
export async function listMyPayments(api: AxiosInstance): Promise<MappedPayment[]> {
  return mapList(await unwrap<PaymentDTO[]>(api.get("/payments")), toPayment, "payment");
}

/** GET /api/payments/:id — with rental request and property details. */
export async function getPayment(api: AxiosInstance, id: string): Promise<MappedPayment> {
  return toPayment(await unwrap<PaymentDTO>(api.get(`/payments/${encodeURIComponent(id)}`)));
}
