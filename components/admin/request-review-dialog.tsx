"use client";

import Image from "next/image";
import { Info, MapPin } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog } from "@/components/ui/dialog";
import type { AdminRequestView, User } from "@/lib/types";
import { formatDate, formatPrice, isOptimizableImage } from "@/lib/utils";

/** Read-only view of a rental request. Decisions belong to the landlord, so there are no actions here. */
export function RequestReviewDialog({ request, onClose }: { request: AdminRequestView | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!request}
      onClose={onClose}
      title="Rental request"
      description={request ? `${request.id} · submitted ${formatDate(request.createdAt)}` : undefined}
      className="max-w-2xl"
    >
      {request && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <span className="text-sm text-stone-500">
              {request.durationMonths} months from {formatDate(request.moveInDate)} · {formatPrice(request.monthlyRent)}/mo
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Person label="Tenant" user={request.tenant} />
            <Person label="Landlord" user={request.landlord} />
          </div>

          <section className="flex gap-3 rounded-xl border border-stone-200 p-3">
            {request.property ? (
              <>
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  <Image
                    src={request.property.images[0]}
                    alt=""
                    fill
                    sizes="64px"
                    unoptimized={!isOptimizableImage(request.property.images[0])}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-medium tracking-wide text-stone-500 uppercase">Property</h3>
                  <p className="font-medium text-stone-900">{request.property.title}</p>
                  <p className="flex items-center gap-1 text-sm text-stone-600">
                    <MapPin aria-hidden className="size-3.5 text-stone-400" />
                    {request.property.location.area}, {request.property.location.city}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-500 italic">The property was removed by the landlord.</p>
            )}
          </section>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Requested", formatDate(request.createdAt)],
              ["Move-in", formatDate(request.moveInDate)],
              ["Duration", `${request.durationMonths} months`],
              ["Monthly rent", formatPrice(request.monthlyRent)],
            ].map(([term, detail]) => (
              <div key={term} className="rounded-lg border border-stone-200 p-3">
                <dt className="text-xs text-stone-500">{term}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-stone-900">{detail}</dd>
              </div>
            ))}
          </dl>

          <section>
            <h3 className="text-sm font-semibold text-stone-900">Message from the tenant</h3>
            <blockquote className="mt-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">{request.message}</blockquote>
            {request.landlordNote && (
              <p className="mt-3 text-sm text-stone-700">
                <span className="font-medium">Landlord&apos;s note:</span> {request.landlordNote}
              </p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-stone-900">Payments</h3>
            {request.payments.length > 0 ? (
              <ul className="mt-2 divide-y divide-stone-100 rounded-xl border border-stone-200">
                {request.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                    <span>
                      <span className="font-medium text-stone-900">{formatPrice(p.amount)}</span>
                      <span className="text-stone-500">
                        {" "}
                        · {formatDate(p.createdAt)} · {paymentMethodLabel[p.method]} ·{" "}
                        <span className="font-mono text-xs">{p.transactionId}</span>
                      </span>
                    </span>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-stone-600">No payments for this request.</p>
            )}
          </section>

          <p className="flex items-start gap-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-950">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-sky-700" />
            Landlords approve or reject requests for their own properties. Admins can review requests here for oversight.
          </p>
        </div>
      )}
    </Dialog>
  );
}

function Person({ label, user }: { label: string; user: User }) {
  return (
    <section className="rounded-xl border border-stone-200 p-3">
      <h3 className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</h3>
      <div className="mt-2 flex items-center gap-3">
        <Avatar name={user.name} src={user.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-stone-900">{user.name}</p>
          <p className="truncate text-sm text-stone-500">{user.email}</p>
        </div>
      </div>
    </section>
  );
}
