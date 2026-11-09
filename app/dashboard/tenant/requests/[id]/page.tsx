import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, MapPin, Wallet } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { RequestStatusPanel } from "@/components/tenant/request-status-panel";
import { buttonVariants } from "@/components/ui/button";
import { getMyRental } from "@/lib/api/tenant";
import { requireUser } from "@/lib/auth/session";
import { formatDate, formatLocation, formatPrice, propertyTypeLabel } from "@/lib/utils";

// GET /api/rentals/:id — shared by generateMetadata and the page. null = not this tenant's request / not found.
const loadRequest = cache((id: string) => getMyRental(id));

export async function generateMetadata({ params }: PageProps<"/dashboard/tenant/requests/[id]">): Promise<Metadata> {
  const request = await loadRequest((await params).id);
  return { title: request ? `Request · ${request.property?.title ?? "Rental request"}` : "Request not found" };
}

export default async function TenantRequestDetailsPage({ params }: PageProps<"/dashboard/tenant/requests/[id]">) {
  await requireUser("TENANT");
  const { id } = await params;
  const request = await loadRequest(id);
  if (!request) notFound();

  const { property } = request;
  const landlord = property?.landlord;

  const details = [
    request.createdAt && { term: "Submitted", detail: formatDate(request.createdAt) },
    request.monthlyRent !== undefined && { term: "Monthly rent", detail: formatPrice(request.monthlyRent) },
  ].filter((d): d is { term: string; detail: string } => !!d);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tenant/requests"
        className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        My requests
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-stone-500">
            Request <span className="font-mono">{request.id}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance text-stone-900 sm:text-3xl">
            {property?.title ?? "Rental request"}
          </h1>
        </div>
        <StatusBadge status={request.status} className="self-start text-sm" />
      </header>

      <RequestStatusPanel request={request} />

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
                <h3 className="text-sm font-medium text-stone-500">Your message{landlord ? ` to ${landlord.name}` : ""}</h3>
                {/* The message includes the applicant details added when the request was sent. */}
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
                      <Link href={`/dashboard/tenant/payments/${p.id}`} className="rounded font-medium text-stone-900 hover:text-brand-700">
                        {p.amount !== undefined ? formatPrice(p.amount) : "Payment"}
                      </Link>
                      <p className="text-sm text-stone-500">
                        {[p.createdAt && formatDate(p.createdAt), p.method && paymentMethodLabel[p.method]].filter(Boolean).join(" · ")}
                        {p.transactionId && (
                          <>
                            {" · "}
                            <span className="font-mono text-xs">{p.transactionId}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                <Wallet aria-hidden className="size-4 text-stone-400" />
                {request.status === "REJECTED"
                  ? "No payment is needed for a declined request."
                  : request.status === "PENDING"
                    ? "Payment becomes available once the landlord approves your request."
                    : request.paymentsIncluded
                      ? "No payment has been made yet."
                      : "Payment details aren't available for this request."}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {property ? (
            <section aria-label="Property" className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <div className="relative aspect-16/10 bg-stone-100">
                <Image src={property.images[0]} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <p className="text-sm text-stone-500">{propertyTypeLabel(property.type)}</p>
                <h2 className="mt-0.5 font-semibold text-stone-900">{property.title}</h2>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
                  {formatLocation(property.location)}
                </p>
                <Link
                  href={`/properties/${property.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}
                >
                  View listing
                </Link>
              </div>
            </section>
          ) : (
            <section aria-label="Property" className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
              This property is no longer listed publicly.
            </section>
          )}

          {landlord && (
            <section aria-labelledby="landlord" className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 id="landlord" className="text-sm font-medium text-stone-500">
                Landlord
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={landlord.name} />
                <p className="font-medium text-stone-900">{landlord.name}</p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
