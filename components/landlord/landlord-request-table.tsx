"use client";

import Link from "next/link";
import { Check, LoaderCircle, X } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import type { DecidableRequest } from "./use-request-decisions";

export const landlordRequestPath = (id: string) => `/dashboard/landlord/requests/${id}`;

interface LandlordRequestTableProps {
  requests: DecidableRequest[];
  /** "manage" shows Approve/Reject; "summary" links to the request instead. */
  mode?: "manage" | "summary";
  onApprove?: (request: DecidableRequest) => void;
  onReject?: (request: DecidableRequest) => void;
}

function StatusCell({ request }: { request: DecidableRequest }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={request.status} />
      {request.saving && (
        <span role="status" className="flex items-center gap-1 text-xs text-stone-500">
          <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
          Saving…
        </span>
      )}
    </div>
  );
}

function PropertyName({ request }: { request: DecidableRequest }) {
  return request.property ? (
    <span className="line-clamp-1">{request.property.title}</span>
  ) : (
    <span className="text-stone-400 italic">Removed property</span>
  );
}

function Actions({ request, mode, onApprove, onReject, stacked = false }: LandlordRequestTableProps & { request: DecidableRequest; stacked?: boolean }) {
  const firstName = request.tenant.name.split(" ")[0];
  if (mode === "manage" && request.status === "PENDING" && !request.saving) {
    return (
      <div className={stacked ? "grid grid-cols-2 gap-2" : "flex justify-end gap-2"}>
        <Button size="sm" onClick={() => onApprove?.(request)} aria-label={`Approve ${firstName}'s request`}>
          <Check />
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReject?.(request)} aria-label={`Reject ${firstName}'s request`}>
          <X />
          Reject
        </Button>
      </div>
    );
  }
  return (
    <Link
      href={landlordRequestPath(request.id)}
      className={buttonVariants({
        variant: mode === "summary" && request.status === "PENDING" ? "secondary" : "outline",
        size: "sm",
        className: stacked ? "w-full" : undefined,
      })}
    >
      {mode === "summary" && request.status === "PENDING" ? "Review" : "View"}
      <span className="sr-only">request from {request.tenant.name}</span>
    </Link>
  );
}

/** Incoming requests: a table on desktop, stacked cards on small screens. */
export function LandlordRequestTable(props: LandlordRequestTableProps) {
  const { requests, mode = "manage" } = props;
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white xl:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs font-medium tracking-wide text-stone-500 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Tenant &amp; property</th>
              <th scope="col" className="px-4 py-3">Dates</th>
              <th scope="col" className="px-4 py-3 text-right">Rent</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {requests.map((r) => (
              <tr key={r.id} className="align-top hover:bg-stone-50/60">
                <td className="w-full max-w-0 px-4 py-3">
                  <div className="flex gap-3">
                    <Avatar name={r.tenant.name} src={r.tenant.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <Link href={landlordRequestPath(r.id)} className="rounded font-medium text-stone-900 hover:text-brand-700">
                        {r.tenant.name}
                      </Link>
                      <p className="mt-0.5 text-stone-700">
                        <PropertyName request={r} />
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-stone-500">“{r.message}”</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                  <p>
                    <span className="text-stone-400">Move-in</span> {formatDate(r.moveInDate)}
                  </p>
                  <p className="mt-0.5">
                    <span className="text-stone-400">Sent</span> {formatDate(r.createdAt)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-stone-900">{formatPrice(r.monthlyRent)}</td>
                <td className="px-4 py-3">
                  <StatusCell request={r} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Actions {...props} mode={mode} request={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
        {requests.map((r) => (
          <li key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={r.tenant.name} src={r.tenant.avatarUrl} size="sm" />
                <Link href={landlordRequestPath(r.id)} className="truncate rounded font-medium text-stone-900 hover:text-brand-700">
                  {r.tenant.name}
                </Link>
              </div>
              <StatusCell request={r} />
            </div>
            <p className="mt-3 text-sm font-medium text-stone-800">
              <PropertyName request={r} />
            </p>
            <p className="mt-1 line-clamp-3 text-sm text-stone-600">“{r.message}”</p>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-stone-500">Move-in</dt>
                <dd className="font-medium text-stone-900">{formatDate(r.moveInDate)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Sent</dt>
                <dd className="font-medium text-stone-900">{formatDate(r.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Rent</dt>
                <dd className="font-medium text-stone-900">{formatPrice(r.monthlyRent)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Actions {...props} mode={mode} request={r} stacked />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
