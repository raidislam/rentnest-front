"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  StatusFilter,
  countByStatus,
  statusFilterLabel,
  type StatusFilterValue,
} from "@/components/shared/status-filter";
import { Button } from "@/components/ui/button";
import { useLandlordRequests } from "@/lib/mock-store";
import type { LandlordRequestView, RequestStatus } from "@/lib/types";
import { LandlordRequestTable } from "./landlord-request-table";
import { RejectRequestDialog } from "./reject-request-dialog";
import { useRequestDecisions } from "./use-request-decisions";

const emptyCopy: Record<RequestStatus, string> = {
  PENDING: "You're all caught up — no requests are waiting for your decision.",
  APPROVED: "No approved requests are waiting for the tenant's payment.",
  REJECTED: "You haven't declined any requests.",
  ACTIVE: "None of your properties have an active rental right now.",
  COMPLETED: "Finished rentals will appear here for your records.",
};

interface RequestManagerProps {
  landlordId: string;
  initialFilter?: StatusFilterValue;
}

export function RequestManager({ landlordId, initialFilter = "ALL" }: RequestManagerProps) {
  const { requests, decide } = useRequestDecisions(useLandlordRequests(landlordId));
  const [filter, setFilter] = useState<StatusFilterValue>(initialFilter);
  const [rejecting, setRejecting] = useState<LandlordRequestView | null>(null);
  // Keep a request in view while its new status is saving, so the optimistic change is visible.
  const visible = filter === "ALL" ? requests : requests.filter((r) => r.status === filter || r.saving);

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No rental requests yet"
        description="When renters request one of your properties, you'll review and respond to them here."
      />
    );
  }

  return (
    <div className="space-y-5">
      <StatusFilter value={filter} onChange={setFilter} counts={countByStatus(requests)} />
      <p aria-live="polite" className="sr-only">
        Showing {visible.length} {statusFilterLabel(filter).toLowerCase()} requests
      </p>

      {visible.length > 0 ? (
        <LandlordRequestTable
          requests={visible}
          onApprove={(r) => decide(r, "APPROVED")}
          onReject={(r) => setRejecting(r)}
        />
      ) : (
        <EmptyState
          icon={Inbox}
          title={`No ${statusFilterLabel(filter).toLowerCase()} requests`}
          description={emptyCopy[filter as RequestStatus]}
          action={
            <Button variant="outline" onClick={() => setFilter("ALL")}>
              Show all requests
            </Button>
          }
        />
      )}

      <RejectRequestDialog
        request={rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={(note) => {
          if (rejecting) decide(rejecting, "REJECTED", note);
          setRejecting(null);
        }}
      />
    </div>
  );
}
