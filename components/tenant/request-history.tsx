"use client";

import Link from "next/link";
import { useState } from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  StatusFilter,
  countByStatus,
  statusFilterLabel as filterLabel,
  type StatusFilterValue as Filter,
} from "@/components/shared/status-filter";
import { Button, buttonVariants } from "@/components/ui/button";
import type { RentalRequestDetails, RequestStatus } from "@/lib/types";
import { RequestTable } from "./request-table";

const emptyCopy: Record<RequestStatus, string> = {
  PENDING: "You have no requests waiting for a landlord's response.",
  APPROVED: "No approved requests are waiting for payment.",
  REJECTED: "None of your requests have been declined.",
  ACTIVE: "You don't have an active rental at the moment.",
  COMPLETED: "Rentals you've finished will appear here.",
};

interface RequestHistoryProps {
  requests: RentalRequestDetails[];
  initialFilter?: Filter;
}

export function RequestHistory({ requests, initialFilter = "ALL" }: RequestHistoryProps) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const visible = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No rental requests yet"
        description="When you request to rent a property, you can follow its status here — from pending to active."
        action={
          <Link href="/properties" className={buttonVariants()}>
            Browse properties
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <StatusFilter value={filter} onChange={setFilter} counts={countByStatus(requests)} />

      <p aria-live="polite" className="sr-only">
        Showing {visible.length} {filterLabel(filter).toLowerCase()} requests
      </p>

      {visible.length > 0 ? (
        <RequestTable requests={visible} />
      ) : (
        <EmptyState
          icon={Inbox}
          title={`No ${filterLabel(filter).toLowerCase()} requests`}
          description={emptyCopy[filter as RequestStatus]}
          action={
            <Button variant="outline" onClick={() => setFilter("ALL")}>
              Show all requests
            </Button>
          }
        />
      )}
    </div>
  );
}
