"use client";

import { useState } from "react";
import { Eye, Inbox, SearchX } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusFilter, countByStatus, statusFilterLabel, type StatusFilterValue } from "@/components/shared/status-filter";
import { Button } from "@/components/ui/button";
import type { MappedRentalRequest } from "@/lib/api/mappers";
import { formatDate, formatPrice } from "@/lib/utils";
import { RequestReviewDialog } from "./request-review-dialog";

/**
 * Read-only list of every rental request (GET /api/admin/rentals). Landlords approve or reject
 * requests; the backend documents no admin rental actions, so there are none here.
 */
export function RequestModeration({ requests, initialFilter = "ALL" }: { requests: MappedRentalRequest[]; initialFilter?: StatusFilterValue }) {
  const [filter, setFilter] = useState<StatusFilterValue>(initialFilter);
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<MappedRentalRequest | null>(null);

  const q = query.trim().toLowerCase();
  const searched = requests.filter(
    (r) => !q || [r.tenant?.name ?? "", r.tenant?.email ?? "", r.propertyTitle ?? ""].some((v) => v.toLowerCase().includes(q)),
  );
  const visible = filter === "ALL" ? searched : searched.filter((r) => r.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <SearchInput label="Search requests" placeholder="Search by tenant or property" value={query} onChange={setQuery} className="xl:w-80" />
        <StatusFilter value={filter} onChange={setFilter} counts={countByStatus(searched)} />
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} {statusFilterLabel(filter).toLowerCase()} requests shown
      </p>

      {requests.length === 0 ? (
        <EmptyState icon={Inbox} title="No rental requests yet" description="Requests appear here as tenants send them." />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No ${statusFilterLabel(filter).toLowerCase()} requests`}
          description="Try a different search or status filter."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setFilter("ALL");
              }}
            >
              Show all requests
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
          {visible.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
              <Avatar name={r.tenant?.name ?? "Tenant"} size="sm" />
              <div className="min-w-0 flex-1 basis-60">
                <p className="truncate font-medium text-stone-900">{r.tenant?.name ?? "Tenant"}</p>
                <p className="truncate text-sm text-stone-700">{r.propertyTitle ?? <span className="text-stone-400 italic">Property unavailable</span>}</p>
                <p className="text-xs text-stone-500">
                  {[r.createdAt && `Sent ${formatDate(r.createdAt)}`, r.monthlyRent !== undefined && `${formatPrice(r.monthlyRent)}/mo`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <StatusBadge status={r.status} />
              <Button variant="outline" size="sm" onClick={() => setViewing(r)} className="w-full sm:w-auto">
                <Eye />
                View
                <span className="sr-only">request from {r.tenant?.name ?? "tenant"}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <RequestReviewDialog request={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
