"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { browserApi } from "@/lib/api/browser";
import { toApiError } from "@/lib/api/errors";
import type { MappedRentalRequest } from "@/lib/api/mappers";
import { decideRentalRequest } from "@/lib/api/services/landlord";

export type DecidableRequest = MappedRentalRequest & { saving?: boolean };
type Decision = "APPROVED" | "REJECTED";

/**
 * Approve/reject landlord requests via PATCH /api/landlord/requests/:id with { status }.
 * The new status is shown only after the backend confirms it (no optimistic update);
 * on failure the request keeps its current status and the backend's message is shown.
 */
export function useRequestDecisions(requests: MappedRentalRequest[]) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<Record<string, Decision>>({});

  const decide = async (request: MappedRentalRequest, status: Decision) => {
    const who = request.tenant?.name.split(" ")[0] ?? "The tenant";
    setSaving((s) => new Set(s).add(request.id));
    try {
      await decideRentalRequest(browserApi, request.id, status);
      setConfirmed((c) => ({ ...c, [request.id]: status }));
      toast(
        status === "APPROVED"
          ? { title: "Request approved", description: `${who} can now complete payment to confirm the rental.` }
          : { title: "Request rejected", description: "The request has been declined." },
      );
      router.refresh(); // reload server data (counts, other pages)
    } catch (err) {
      // 401 redirects to login (browserApi). 400/403/404/409/network: show the backend's message.
      toast({
        title: status === "APPROVED" ? "Couldn't approve request" : "Couldn't reject request",
        description: toApiError(err).message,
        variant: "error",
      });
    } finally {
      setSaving((s) => {
        const next = new Set(s);
        next.delete(request.id);
        return next;
      });
    }
  };

  const withState: DecidableRequest[] = requests.map((r) => ({
    ...r,
    status: confirmed[r.id] ?? r.status,
    saving: saving.has(r.id),
  }));

  return { requests: withState, decide };
}
