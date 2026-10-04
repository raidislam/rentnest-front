"use client";

import { useState } from "react";
import { Eye, Inbox, SearchX } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  StatusFilter,
  countByStatus,
  statusFilterLabel,
  type StatusFilterValue,
} from "@/components/shared/status-filter";
import { Button } from "@/components/ui/button";
import { useAdminRequests } from "@/lib/mock-store";
import type { AdminRequestView } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { RequestReviewDialog } from "./request-review-dialog";

export function RequestModeration({ initialFilter = "ALL" }: { initialFilter?: StatusFilterValue }) {
  const requests = useAdminRequests();
  const [filter, setFilter] = useState<StatusFilterValue>(initialFilter);
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<AdminRequestView | null>(null);

  const q = query.trim().toLowerCase();
  const searched = requests.filter(
    (r) => !q || [r.tenant.name, r.landlord.name, r.property?.title ?? ""].some((v) => v.toLowerCase().includes(q)),
  );
  const visible = filter === "ALL" ? searched : searched.filter((r) => r.status === filter);

  if (requests.length === 0) {
    return <EmptyState icon={Inbox} title="No rental requests yet" description="Requests appear here as tenants send them." />;
  }

  return (
    <div className="space-y-5">
      <SearchInput
        label="Search requests"
        placeholder="Search by tenant, property or landlord"
        value={query}
        onChange={setQuery}
        className="lg:w-96"
      />
      <StatusFilter value={filter} onChange={setFilter} counts={countByStatus(searched)} />

      <p aria-live="polite" className="sr-only">
        {visible.length} requests shown
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={q ? SearchX : Inbox}
          title={
            searched.length === 0
              ? "No requests match your search"
              : `No ${statusFilterLabel(filter).toLowerCase()} requests${q ? " match your search" : ""}`
          }
          description={
            searched.length === 0
              ? "Try a different tenant, landlord or property name."
              : "There are no requests with this status. Try another status filter."
          }
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
        <>
          <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-medium tracking-wide text-stone-500 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Tenant · property · landlord</th>
                  <th scope="col" className="px-4 py-3">Dates</th>
                  <th scope="col" className="px-4 py-3 text-right">Rent</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/60">
                    <td className="w-full max-w-0 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.tenant.name} src={r.tenant.avatarUrl} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-900">{r.tenant.name}</p>
                          <p className="truncate text-stone-600">
                            {r.property ? r.property.title : <span className="text-stone-400 italic">Removed property</span>}
                          </p>
                          <p className="truncate text-stone-500">Landlord: {r.landlord.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                      <p>
                        <span className="text-stone-400">Sent</span> {formatDate(r.createdAt)}
                      </p>
                      <p className="mt-0.5">
                        <span className="text-stone-400">Move-in</span> {formatDate(r.moveInDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-stone-900">{formatPrice(r.monthlyRent)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setViewing(r)}>
                        <Eye />
                        View
                        <span className="sr-only">request from {r.tenant.name}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
            {visible.map((r) => (
              <li key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={r.tenant.name} src={r.tenant.avatarUrl} size="sm" />
                    <span className="truncate font-medium text-stone-900">{r.tenant.name}</span>
                  </div>
                  <StatusBadge status={r.status} className="shrink-0" />
                </div>
                <p className="mt-3 text-sm font-medium text-stone-800">
                  {r.property ? r.property.title : <span className="font-normal text-stone-400 italic">Removed property</span>}
                </p>
                <p className="text-sm text-stone-500">Landlord: {r.landlord.name}</p>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-stone-500">Sent</dt>
                    <dd className="font-medium text-stone-900">{formatDate(r.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Move-in</dt>
                    <dd className="font-medium text-stone-900">{formatDate(r.moveInDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Rent</dt>
                    <dd className="font-medium text-stone-900">{formatPrice(r.monthlyRent)}</dd>
                  </div>
                </dl>
                <Button variant="outline" size="sm" onClick={() => setViewing(r)} className="mt-4 w-full">
                  <Eye />
                  View details
                  <span className="sr-only">for the request from {r.tenant.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      <RequestReviewDialog request={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
