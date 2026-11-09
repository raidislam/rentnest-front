import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, Info, MapPin } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { tenantRequestPath } from "@/components/tenant/request-actions";
import { buttonVariants } from "@/components/ui/button";
import { PaymentForm } from "@/components/tenant/payment-form";
import { getMyRental } from "@/lib/api/tenant";
import { requireUser } from "@/lib/auth/session";
import type { RequestStatus } from "@/lib/types";
import { formatLocation, formatPrice } from "@/lib/utils";

// GET /api/rentals/:id, shared by generateMetadata and the page. Loading it in metadata means a
// missing/foreign request resolves to a proper 404 before the page starts streaming.
const loadRequest = cache((id: string) => getMyRental(id));

export async function generateMetadata({ params }: PageProps<"/dashboard/tenant/requests/[id]/pay">): Promise<Metadata> {
  const request = await loadRequest((await params).id);
  return { title: request ? "Complete payment" : "Request not found" };
}

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
  const session = await requireUser("TENANT");
  const { id } = await params;
  const request = await loadRequest(id);
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

  const { property } = request;
  const summary = [
    { term: "Tenant", detail: session.name },
    property?.landlord && { term: "Landlord", detail: property.landlord.name },
    request.monthlyRent !== undefined && { term: "Monthly rent", detail: formatPrice(request.monthlyRent) },
  ].filter((row): row is { term: string; detail: string } => !!row);

  return (
    <div className="space-y-6">
      {backLink}
      <PageHeader title="Complete your payment" description="Pay to confirm and activate your rental." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-label="Payment" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          {/* POST /api/payments/create, then redirect to SSLCommerz. GET /api/rentals/:id includes the latest attempt. */}
          <PaymentForm rentalRequestId={request.id} amount={request.monthlyRent} previousStatus={request.payments[0]?.status} />
        </section>

        <aside aria-labelledby="order-summary" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 lg:sticky lg:top-10">
          <h2 id="order-summary" className="font-semibold">
            Payment summary
          </h2>
          <div className="mt-4 flex gap-3">
            {property && (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                <Image src={property.images[0]} alt="" fill sizes="64px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-stone-900">{property?.title ?? "Rental request"}</p>
              {property && (
                <p className="mt-0.5 flex items-start gap-1 text-sm text-stone-600">
                  <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-stone-400" />
                  {formatLocation({ ...property.location, address: "" })}
                </p>
              )}
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
        </aside>
      </div>
    </div>
  );
}
