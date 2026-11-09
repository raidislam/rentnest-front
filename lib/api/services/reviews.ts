// Tenant review endpoint (Postman folder "Tenant").

import type { AxiosInstance } from "axios";
import type { CreateReviewBody } from "../dto";
import { unwrapVoid } from "../http";

/**
 * POST /api/reviews — only after the rental is COMPLETED; rating 1–5;
 * one review per property per tenant (409 on duplicate). The response body is not used (unverified).
 */
export async function createReview(api: AxiosInstance, body: CreateReviewBody): Promise<void> {
  await unwrapVoid(api.post("/reviews", body));
}
