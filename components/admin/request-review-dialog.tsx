"use client";

import { Mail } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog } from "@/components/ui/dialog";
import type { MappedRentalRequest } from "@/lib/api/mappers";
import { formatDate, formatPrice } from "@/lib/utils";

/**
 * Read-only view of a rental request (from GET /api/admin/rentals: tenant, partial property and payment;
 * the landlord isn't included). Decisions belong to the landlord, so there are no actions.
 */
export function RequestReviewDialog({ request, onClose }: { request: MappedRentalRequest | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!request}
      onClose={onClose}
      title={request?.propertyTitle ?? "Rental request"}
      description={request ? [request.id, request.createdAt && `submitted ${formatDate(request.createdAt)}`].filter(Boolean).join(" · ") : undefined}
      className="max-w-xl"
    >
      {request && (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            {request.monthlyRent !== undefined && <span className="font-medium text-stone-900">{formatPrice(request.monthlyRent)}/mo</span>}
          </div>

          {request.tenant && (
            <section className="flex items-center gap-3 rounded-lg border border-stone-200 p-3">
              <Avatar name={request.tenant.name} size="sm" />
              <div className="min-w-0">
                <p className="text-xs text-stone-500">Tenant</p>
                <p className="font-medium text-stone-900">{request.tenant.name}</p>
                {request.tenant.email && (
                  <a href={`mailto:${request.tenant.email}`} className="flex items-center gap-1 text-xs break-all text-stone-500 hover:text-brand-700">
                    <Mail aria-hidden className="size-3.5" />
                    {request.tenant.email}
                  </a>
                )}
              </div>
            </section>
          )}

          {request.message && (
            <section>
              <h4 className="font-semibold text-stone-900">Message</h4>
              <blockquote className="mt-2 rounded-lg bg-stone-50 p-3 whitespace-pre-line text-stone-700">{request.message}</blockquote>
            </section>
          )}

          <section>
            <h4 className="font-semibold text-stone-900">Payment</h4>
            {request.payments.length > 0 ? (
              <ul className="mt-2 divide-y divide-stone-100">
                {request.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="text-stone-700">
                      {[p.amount !== undefined && formatPrice(p.amount), p.method && paymentMethodLabel[p.method], p.transactionId].filter(Boolean).join(" · ")}
                    </span>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-stone-600">{request.paymentsIncluded ? "No payment for this request yet." : "Payment details aren't available."}</p>
            )}
          </section>
        </div>
      )}
    </Dialog>
  );
}
