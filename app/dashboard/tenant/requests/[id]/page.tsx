import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Wallet } from "lucide-react";
import { StarRating } from "@/components/properties/review-list";
import { Avatar } from "@/components/shared/avatar";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { RequestStatusPanel } from "@/components/tenant/request-status-panel";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getTenantRequestById } from "@/lib/mock-data";
import { formatDate, formatPrice, propertyTypeLabel } from "@/lib/utils";

const getOwnRequest = (id: string) => getTenantRequestById(getCurrentUser("TENANT").id, id);

export async function generateMetadata({ params }: PageProps<"/dashboard/tenant/requests/[id]">): Promise<Metadata> {
  const request = getOwnRequest((await params).id);
  return { title: request ? `Request · ${request.property.title}` : "Request not found" };
}

export default async function TenantRequestDetailsPage({ params }: PageProps<"/dashboard/tenant/requests/[id]">) {
  const { id } = await params;
  // Future: GET /api/rentals/:id
  const request = getOwnRequest(id);
  if (!request) notFound();

  const { property, landlord } = request;
  const contactShared = request.status !== "PENDING" && request.status !== "REJECTED";

  const details = [
    { term: "Submitted", detail: formatDate(request.createdAt) },
    { term: "Preferred move-in", detail: formatDate(request.moveInDate) },
    { term: "Duration", detail: `${request.durationMonths} months` },
    { term: "Monthly rent", detail: formatPrice(request.monthlyRent) },
  ];

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
            {property.title}
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
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {details.map(({ term, detail }) => (
                <div key={term}>
                  <dt className="text-sm text-stone-500">{term}</dt>
                  <dd className="mt-0.5 font-medium text-stone-900">{detail}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 border-t border-stone-100 pt-5">
              <h3 className="text-sm font-medium text-stone-500">Your message to {landlord.name}</h3>
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
                        {formatDate(p.createdAt)} · {paymentMethodLabel[p.method]} ·{" "}
                        <span className="font-mono text-xs">{p.transactionId}</span>
                      </p>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                <Wallet aria-hidden className="size-4 text-stone-400" />
                {request.status === "APPROVED"
                  ? "No payment has been made yet."
                  : request.status === "REJECTED"
                    ? "No payment is needed for a declined request."
                    : "Payment becomes available once the landlord approves your request."}
              </p>
            )}
          </section>

          {request.review && (
            <section aria-labelledby="your-review" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="your-review" className="font-semibold">
                  Your review
                </h2>
                <time dateTime={request.review.createdAt} className="text-sm text-stone-500">
                  {formatDate(request.review.createdAt)}
                </time>
              </div>
              <StarRating rating={request.review.rating} className="mt-3" />
              <p className="mt-2 text-stone-700">{request.review.comment}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section aria-label="Property" className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="relative aspect-16/10 bg-stone-100">
              <Image src={property.images[0]} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
            </div>
            <div className="p-5">
              <p className="text-sm text-stone-500">{propertyTypeLabel(property.type)}</p>
              <h2 className="mt-0.5 font-semibold text-stone-900">{property.title}</h2>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
                {property.location.address}, {property.location.area}, {property.location.city}
              </p>
              <Link
                href={`/properties/${property.id}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}
              >
                View listing
              </Link>
            </div>
          </section>

          <section aria-labelledby="landlord" className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 id="landlord" className="text-sm font-medium text-stone-500">
              Landlord
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={landlord.name} src={landlord.avatarUrl} />
              <p className="font-medium text-stone-900">{landlord.name}</p>
            </div>
            {contactShared ? (
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href={`tel:${landlord.phone.replace(/[\s-]/g, "")}`} className="flex items-center gap-2 rounded py-0.5 text-stone-700 hover:text-brand-700">
                    <Phone aria-hidden className="size-4 text-stone-400" />
                    {landlord.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${landlord.email}`} className="flex items-center gap-2 rounded py-0.5 break-all text-stone-700 hover:text-brand-700">
                    <Mail aria-hidden className="size-4 shrink-0 text-stone-400" />
                    {landlord.email}
                  </a>
                </li>
              </ul>
            ) : (
              <p className="mt-4 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
                Contact details are shared once your rental request is approved.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
