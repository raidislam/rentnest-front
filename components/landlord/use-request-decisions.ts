"use client";

import { startTransition, useOptimistic } from "react";
import { useToast } from "@/components/ui/toast";
import { MockApiError, updateRentalRequestStatus } from "@/lib/mock-api";
import type { LandlordRequestView } from "@/lib/types";

export type DecidableRequest = LandlordRequestView & { saving?: boolean };
type Decision = "APPROVED" | "REJECTED";

/**
 * Optimistic approve/reject for landlord requests.
 *
 * The new status shows immediately (marked `saving` until the mock request
 * settles). On success the store holds the new status; on failure React
 * discards the optimistic value, so the request rolls back to PENDING.
 *
 * Demo: add `?simulateFailure=1` to the page URL to see the rollback path.
 */
export function useRequestDecisions(requests: LandlordRequestView[]) {
  const toast = useToast();
  const [optimisticRequests, applyOptimistic] = useOptimistic(
    requests as DecidableRequest[],
    (state, update: { id: string; status: Decision }) =>
      state.map((r) => (r.id === update.id ? { ...r, status: update.status, saving: true } : r)),
  );

  const decide = (request: LandlordRequestView, status: Decision, note?: string) => {
    const simulateFailure = new URLSearchParams(window.location.search).has("simulateFailure");
    const firstName = request.tenant.name.split(" ")[0];

    startTransition(async () => {
      applyOptimistic({ id: request.id, status });
      try {
        await updateRentalRequestStatus(request.id, status, { note, simulateFailure });
        toast(
          status === "APPROVED"
            ? { title: "Request approved", description: `${firstName} can now complete payment to confirm the rental.` }
            : { title: "Request rejected", description: `${firstName}'s request has been declined.` },
        );
      } catch (err) {
        toast({
          title: status === "APPROVED" ? "Couldn't approve request" : "Couldn't reject request",
          description: `${err instanceof MockApiError ? err.message : "Something went wrong."} The request is still pending.`,
          variant: "error",
        });
      }
    });
  };

  return { requests: optimisticRequests, decide };
}
