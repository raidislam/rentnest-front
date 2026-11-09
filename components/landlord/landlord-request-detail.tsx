"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleCheckBig,
  CircleX,
  Hourglass,
  House,
  LoaderCircle,
  Mail,
  MapPin,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { MappedRentalRequest } from "@/lib/api/mappers";
import type { RequestStatus } from "@/lib/types";
import { cn, formatDate, formatLocation, formatPrice } from "@/lib/utils";
import { RejectRequestDialog } from "./reject-request-dialog";
import { useRequestDecisions } from "./use-request-decisions";

const panel: Record<RequestStatus, { icon: LucideIcon; box: string; iconColor: string; title: string }> = {
  PENDING: { icon: Hourglass, box: "border-amber-200 bg-amber-50", iconColor: "text-amber-700", title: "Awaiting your decision" },
  APPROVED: { icon: BadgeCheck, box: "border-sky-200 bg-sky-50", iconColor: "text-sky-700", title: "Approved" },
  REJECTED: { icon: CircleX, box: "border-red-200 bg-red-50", iconColor: "text-red-600", title: "Rejected" },
  ACTIVE: { icon: House, box: "border-brand-200 bg-brand-50", iconColor: "text-brand-700", title: "Active rental" },
  COMPLETED: { icon: CircleCheckBig, box: "border-stone-200 bg-stone-100/70", iconColor: "text-stone-600", title: "Rental completed" },
};

/** One request from GET /api/landlord/requests (there is no single-request endpoint). */
export function LandlordRequestDetail({ request: initial }: { request: MappedRentalRequest }) {
  const {
    requests: [request],
    decide,
  } = useRequestDecisions([initial]);
  const [rejecting, setRejecting] = useState(false);

  const { tenant, property } = request;
  const firstName = tenant?.name.split(" ")[0] ?? "the tenant";
  const { icon: Icon, box, iconColor, title } = panel[request.status];
  const body: Record<RequestStatus, string> = {
    PENDING: `Review this request below. Approving lets ${firstName} pay to confirm the rental.`,
    APPROVED: `You approved this request. Waiting for ${firstName} to complete payment.`,
    REJECTED: "You declined this request.",
    ACTIVE: `${firstName} has paid and is currently renting this property.`,
    COMPLETED: "This rental has ended.",
  };

  // Move-in date and duration aren't backend fields; tenants include them in the message.
  const details = [
    request.createdAt && { term: "Submitted", detail: formatDate(request.createdAt) },
    request.monthlyRent !== undefined && { term: "Monthly rent", detail: formatPrice(request.monthlyRent) },
  ].filter((d): d is { term: string; detail: string } => !!d);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/landlord/requests"
        className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Rental requests
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-stone-500">
            Request <span className="font-mono">{request.id}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {tenant ? `Request from ${tenant.name}` : property ? `Request for ${property.title}` : "Rental request"}
          </h1>
        </div>
        <StatusBadge status={request.status} className="self-start text-sm" />
      </header>

      <section
        aria-label="Decision"
        className={cn("flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between", box)}
      >
        <div className="flex gap-3">
          <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", iconColor)} />
          <div>
            <h2 className="font-semibold text-stone-900">{title}</h2>
            <p className="mt-1 text-sm text-stone-700">{body[request.status]}</p>
          </div>
        </div>
        {request.saving ? (
          <p role="status" className="flex shrink-0 items-center gap-2 text-sm font-medium text-stone-600">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Saving…
          </p>
        ) : (
          request.status === "PENDING" && (
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
              <Button onClick={() => decide(request, "APPROVED")}>
                <Check />
                Approve
              </Button>
              <Button variant="outline" onClick={() => setRejecting(true)}>
                <X />
                Reject
              </Button>
            </div>
          )
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="request-details" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
            <h2 id="request-details" className="font-semibold">
              Request details
            </h2>
            {details.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {details.map(({ term, detail }) => (
                  <div key={term}>
                    <dt className="text-sm text-stone-500">{term}</dt>
                    <dd className="mt-0.5 font-medium text-stone-900">{detail}</dd>
                  </div>
                ))}
              </dl>
            )}
            {request.message && (
              <div className={details.length > 0 ? "mt-6 border-t border-stone-100 pt-5" : "mt-4"}>
                <h3 className="text-sm font-medium text-stone-500">Message from {firstName}</h3>
                {/* Includes the applicant details (phone, move-in date, duration) added by the tenant form. */}
                <blockquote className="mt-2 rounded-lg bg-stone-50 p-4 whitespace-pre-line text-stone-700">{request.message}</blockquote>
              </div>
            )}
          </section>

          <section aria-labelledby="request-payments" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
            <h2 id="request-payments" className="font-semibold">
              Payments
            </h2>
            {request.payments.length > 0 ? (
              <ul className="mt-4 divide-y divide-stone-100">
                {request.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium text-stone-900">{p.amount !== undefined ? formatPrice(p.amount) : "Payment"}</p>
                      <p className="text-sm text-stone-500">
                        {[p.createdAt && formatDate(p.createdAt), p.method && paymentMethodLabel[p.method]].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-stone-600">
                {request.paymentsIncluded
                  ? "No payments have been made for this request yet."
                  : "Payment details aren't available for this request."}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {/* Shown only if the backend includes the tenant; contact details are also in the message. */}
          {tenant && (
            <section aria-labelledby="tenant-heading" className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 id="tenant-heading" className="text-sm font-medium text-stone-500">
                Tenant
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={tenant.name} size="lg" />
                <p className="font-semibold text-stone-900">{tenant.name}</p>
              </div>
              {tenant.email && (
                <a
                  href={`mailto:${tenant.email}`}
                  className="mt-4 flex items-center gap-2 rounded py-0.5 text-sm break-all text-stone-700 hover:text-brand-700"
                >
                  <Mail aria-hidden className="size-4 shrink-0 text-stone-400" />
                  {tenant.email}
                </a>
              )}
            </section>
          )}

          <section aria-label="Property" className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            {property ? (
              <>
                <div className="relative aspect-16/10 bg-stone-100">
                  <Image src={property.images[0]} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-stone-900">{property.title}</h2>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
                    {formatLocation(property.location)}
                  </p>
                  <Link
                    href={`/dashboard/landlord/properties/${property.id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}
                  >
                    Manage property
                  </Link>
                </div>
              </>
            ) : (
              <p className="p-5 text-sm text-stone-500 italic">This property is no longer in your listings.</p>
            )}
          </section>
        </aside>
      </div>

      <RejectRequestDialog
        request={rejecting ? request : null}
        onClose={() => setRejecting(false)}
        onConfirm={() => {
          decide(request, "REJECTED");
          setRejecting(false);
        }}
      />
    </div>
  );
}
