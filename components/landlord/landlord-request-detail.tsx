"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleCheckBig,
  CircleX,
  Hourglass,
  House,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  SearchX,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLandlordRequests } from "@/lib/mock-store";
import type { RequestStatus } from "@/lib/types";
import { cn, formatDate, formatPrice, isOptimizableImage } from "@/lib/utils";
import { RejectRequestDialog } from "./reject-request-dialog";
import { useRequestDecisions } from "./use-request-decisions";

const panel: Record<RequestStatus, { icon: LucideIcon; box: string; iconColor: string; title: string }> = {
  PENDING: { icon: Hourglass, box: "border-amber-200 bg-amber-50", iconColor: "text-amber-700", title: "Awaiting your decision" },
  APPROVED: { icon: BadgeCheck, box: "border-sky-200 bg-sky-50", iconColor: "text-sky-700", title: "Approved" },
  REJECTED: { icon: CircleX, box: "border-red-200 bg-red-50", iconColor: "text-red-600", title: "Rejected" },
  ACTIVE: { icon: House, box: "border-brand-200 bg-brand-50", iconColor: "text-brand-700", title: "Active rental" },
  COMPLETED: { icon: CircleCheckBig, box: "border-stone-200 bg-stone-100/70", iconColor: "text-stone-600", title: "Rental completed" },
};

export function LandlordRequestDetail({ landlordId, requestId }: { landlordId: string; requestId: string }) {
  const { requests, decide } = useRequestDecisions(useLandlordRequests(landlordId));
  const [rejecting, setRejecting] = useState(false);
  const request = requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <EmptyState
        icon={SearchX}
        as="h1"
        title="We couldn't find that request"
        description="It may have been removed, or it belongs to another landlord's property."
        className="mx-auto mt-8 max-w-lg"
        action={
          <Link href="/dashboard/landlord/requests" className={buttonVariants()}>
            View all requests
          </Link>
        }
      />
    );
  }

  const { tenant, property } = request;
  const firstName = tenant.name.split(" ")[0];
  const { icon: Icon, box, iconColor, title } = panel[request.status];
  const body: Record<RequestStatus, string> = {
    PENDING: `Review ${firstName}'s request below. Approving lets them pay the first month's rent to confirm the rental.`,
    APPROVED: `You approved this request. Waiting for ${firstName} to complete payment.`,
    REJECTED: request.landlordNote ? `You declined this request with the note: “${request.landlordNote}”` : "You declined this request.",
    ACTIVE: `${firstName} has paid and is currently renting this property.`,
    COMPLETED: "This rental has ended.",
  };

  const details = [
    { term: "Submitted", detail: formatDate(request.createdAt) },
    { term: "Preferred move-in", detail: formatDate(request.moveInDate) },
    { term: "Duration", detail: `${request.durationMonths} months` },
    { term: "Monthly rent", detail: formatPrice(request.monthlyRent) },
  ];

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
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Request from {tenant.name}</h1>
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
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {details.map(({ term, detail }) => (
                <div key={term}>
                  <dt className="text-sm text-stone-500">{term}</dt>
                  <dd className="mt-0.5 font-medium text-stone-900">{detail}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 border-t border-stone-100 pt-5">
              <h3 className="text-sm font-medium text-stone-500">Message from {firstName}</h3>
              <blockquote className="mt-2 rounded-lg bg-stone-50 p-4 text-stone-700">{request.message}</blockquote>
            </div>
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
                      <p className="font-medium text-stone-900">{formatPrice(p.amount)}</p>
                      <p className="text-sm text-stone-500">
                        {formatDate(p.createdAt)} · {paymentMethodLabel[p.method]}
                      </p>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-stone-600">No payments have been made for this request yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="tenant-heading" className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 id="tenant-heading" className="text-sm font-medium text-stone-500">
              Tenant
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={tenant.name} src={tenant.avatarUrl} size="lg" />
              <div>
                <p className="font-semibold text-stone-900">{tenant.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-stone-500">
                  <CalendarDays aria-hidden className="size-3.5" />
                  Member since {formatDate(tenant.createdAt)}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 rounded py-0.5 break-all text-stone-700 hover:text-brand-700">
                  <Mail aria-hidden className="size-4 shrink-0 text-stone-400" />
                  {tenant.email}
                </a>
              </li>
              <li>
                <a href={`tel:${tenant.phone.replace(/[\s-]/g, "")}`} className="flex items-center gap-2 rounded py-0.5 text-stone-700 hover:text-brand-700">
                  <Phone aria-hidden className="size-4 text-stone-400" />
                  {tenant.phone}
                </a>
              </li>
            </ul>
          </section>

          <section aria-label="Property" className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            {property ? (
              <>
                <div className="relative aspect-16/10 bg-stone-100">
                  <Image
                    src={property.images[0]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 320px, 100vw"
                    unoptimized={!isOptimizableImage(property.images[0])}
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-stone-900">{property.title}</h2>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
                    {property.location.area}, {property.location.city}
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
              <p className="p-5 text-sm text-stone-500 italic">This property has been removed from your listings.</p>
            )}
          </section>
        </aside>
      </div>

      <RejectRequestDialog
        request={rejecting ? request : null}
        onClose={() => setRejecting(false)}
        onConfirm={(note) => {
          decide(request, "REJECTED", note);
          setRejecting(false);
        }}
      />
    </div>
  );
}
