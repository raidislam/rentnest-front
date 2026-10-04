import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info, MapPin } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentForm } from "@/components/tenant/payment-form";
import { tenantRequestPath } from "@/components/tenant/request-actions";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getTenantRequestById } from "@/lib/mock-data";
import type { RequestStatus } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Complete payment" };

const notPayable: Partial<Record<RequestStatus, { title: string; description: string }>> = {
  PENDING: {
    title: "Payment isn't available yet",
    description: "You can pay once the landlord approves your request. We'll show a Pay now button when it's ready.",
  },
  REJECTED: {
    title: "This request was declined",
    description: "No payment is needed for a declined request. Browse other homes to send a new request.",
  },
  ACTIVE: {
    title: "Already paid",
    description: "Payment for this rental is complete and it's now active.",
  },
  COMPLETED: {
    title: "Already paid",
    description: "This rental has been paid for and has since ended.",
  },
};

export default async function TenantPaymentPage({ params }: PageProps<"/dashboard/tenant/requests/[id]/pay">) {
  const { id } = await params;
  const tenant = getCurrentUser("TENANT");
  const request = getTenantRequestById(tenant.id, id);
  if (!request) notFound();

  const backLink = (
    <Link
      href={tenantRequestPath(request.id)}
      className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-medium text-stone-600 hover:text-stone-900"
    >
      <ArrowLeft aria-hidden className="size-4" />
      Back to request
    </Link>
  );

  const blocked = notPayable[request.status];
  if (blocked) {
    return (
      <div className="space-y-6">
        {backLink}
        <EmptyState
          icon={Info}
          as="h1"
          title={blocked.title}
          description={blocked.description}
          action={
            <Link href={tenantRequestPath(request.id)} className={buttonVariants()}>
              View request
            </Link>
          }
        />
      </div>
    );
  }

  const { property, landlord } = request;
  // The first month's rent is collected to activate the rental.
  const amountDue = request.monthlyRent;

  const summary = [
    { term: "Tenant", detail: tenant.name },
    { term: "Landlord", detail: landlord.name },
    { term: "Move-in date", detail: formatDate(request.moveInDate) },
    { term: "Lease length", detail: `${request.durationMonths} months` },
    { term: "Monthly rent", detail: formatPrice(request.monthlyRent) },
  ];

  return (
    <div className="space-y-6">
      {backLink}
      <PageHeader title="Complete your payment" description="Pay the first month's rent to confirm and activate your rental." />

      <div role="note" className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-sky-700" />
        <p>
          <span className="font-medium">Demo mode.</span> The payment gateway isn&apos;t connected yet — no money will be
          charged and no payment details are collected. Clicking Pay simulates a successful payment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-label="Payment" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          <PaymentForm rentalRequestId={request.id} amount={amountDue} />
        </section>

        <aside aria-labelledby="order-summary" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 lg:sticky lg:top-10">
          <h2 id="order-summary" className="font-semibold">
            Payment summary
          </h2>
          <div className="mt-4 flex gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <Image src={property.images[0]} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-stone-900">{property.title}</p>
              <p className="mt-0.5 flex items-start gap-1 text-sm text-stone-600">
                <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-stone-400" />
                {property.location.area}, {property.location.city}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-stone-100 pt-5 text-sm">
            {summary.map(({ term, detail }) => (
              <div key={term} className="flex justify-between gap-4">
                <dt className="text-stone-500">{term}</dt>
                <dd className="text-right font-medium text-stone-900">{detail}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-stone-200 pt-5">
            <span className="font-medium text-stone-900">Amount due now</span>
            <span className="text-2xl font-semibold text-stone-900">{formatPrice(amountDue)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-stone-500">First month&apos;s rent · BDT</p>
        </aside>
      </div>
    </div>
  );
}
