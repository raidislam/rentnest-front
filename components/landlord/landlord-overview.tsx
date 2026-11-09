import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CircleCheck, ClipboardList, Hourglass, Inbox, MessageSquare, Plus, Star } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StarRating } from "@/components/properties/review-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { MappedProperty, MappedRentalRequest, MappedReview } from "@/lib/api/mappers";
import { ratingSummary } from "@/lib/property-insights";
import { formatDate, formatLocation, formatPrice } from "@/lib/utils";
import { LandlordRequestTable } from "./landlord-request-table";

interface LandlordOverviewProps {
  firstName: string;
  /** GET /api/landlord/properties */
  properties: MappedProperty[];
  /** GET /api/landlord/requests */
  requests: MappedRentalRequest[];
  /** GET /api/landlord/reviews; null if they couldn't be loaded. */
  reviews: MappedReview[] | null;
}

/** Landlord dashboard. Every number is computed from the backend lists above. */
export function LandlordOverview({ firstName, properties, requests, reviews }: LandlordOverviewProps) {
  const pending = requests.filter((r) => r.status === "PENDING");
  const available = properties.filter((p) => p.isAvailable).length;
  const requestCount = (propertyId: string) => requests.filter((r) => r.propertyId === propertyId).length;
  const rating = ratingSummary(reviews ?? []);
  const propertyTitle = (review: MappedReview) =>
    review.propertyTitle ?? properties.find((p) => p.id === review.propertyId)?.title ?? "Your property";

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Manage your listings and respond to rental requests."
        actions={
          <>
            <Link href="/dashboard/landlord/requests" className={buttonVariants({ variant: "outline" })}>
              <ClipboardList />
              View requests
            </Link>
            <Link href="/dashboard/landlord/properties/new" className={buttonVariants()}>
              <Plus />
              Add property
            </Link>
          </>
        }
      />

      {pending.length > 0 && (
        <div
          role="status"
          className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <Hourglass aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-medium text-amber-950">
                {pending.length} {pending.length === 1 ? "request is" : "requests are"} waiting for your decision
              </p>
              <p className="text-sm text-amber-900/80">Renters are more likely to book when landlords respond quickly.</p>
            </div>
          </div>
          <Link href="/dashboard/landlord/requests?status=PENDING" className={buttonVariants({ className: "w-full sm:w-auto" })}>
            Review requests
          </Link>
        </div>
      )}

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total properties" value={properties.length} icon={Building2} />
        <StatCard label="Available" value={available} icon={CircleCheck} tone="brand" hint="Shown in search" />
        <StatCard label="Pending requests" value={pending.length} icon={Hourglass} tone="amber" hint="Awaiting your decision" />
        <StatCard
          label="Reviews"
          value={reviews ? rating.count : "—"}
          icon={Star}
          tone="blue"
          hint={!reviews ? "Couldn't load reviews" : rating.count > 0 ? `${rating.average.toFixed(1)} average rating` : "No reviews yet"}
        />
      </section>

      <section aria-labelledby="recent-requests">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-requests" className="text-lg font-semibold">
            Recent requests
          </h2>
          {requests.length > 0 && (
            <Link href="/dashboard/landlord/requests" className="flex items-center gap-1 rounded py-0.5 text-sm font-medium text-brand-700 hover:text-brand-800">
              View all requests
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
        <div className="mt-4">
          {requests.length > 0 ? (
            <LandlordRequestTable requests={requests.slice(0, 4)} mode="summary" />
          ) : (
            <EmptyState icon={Inbox} title="No requests yet" description="Rental requests for your properties will appear here." />
          )}
        </div>
      </section>

      <section aria-labelledby="your-properties">
        <div className="flex items-center justify-between gap-4">
          <h2 id="your-properties" className="text-lg font-semibold">
            Your properties
          </h2>
          {properties.length > 0 && (
            <Link href="/dashboard/landlord/properties" className="flex items-center gap-1 rounded py-0.5 text-sm font-medium text-brand-700 hover:text-brand-800">
              Manage properties
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
        <div className="mt-4">
          {properties.length > 0 ? (
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
              {properties.slice(0, 4).map((p) => {
                const count = requestCount(p.id);
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="line-clamp-1 font-medium text-stone-900">{p.title}</p>
                      <p className="text-sm text-stone-500">
                        {formatLocation({ ...p.location, address: "" })} · {formatPrice(p.price)}/mo
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={p.isAvailable ? "brand" : "neutral"}>{p.isAvailable ? "Available" : "Unavailable"}</Badge>
                      <span className="text-sm text-stone-500">
                        {count} {count === 1 ? "request" : "requests"}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/landlord/properties/${p.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm", className: "w-full sm:ml-auto sm:w-auto" })}
                    >
                      Edit
                      <span className="sr-only">{p.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={Building2}
              title="No properties yet"
              description="List your first property to start receiving rental requests."
              action={
                <Link href="/dashboard/landlord/properties/new" className={buttonVariants()}>
                  <Plus />
                  Add property
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section aria-labelledby="recent-reviews">
        <h2 id="recent-reviews" className="text-lg font-semibold">
          Recent reviews
        </h2>
        <div className="mt-4">
          {reviews === null ? (
            <p role="alert" className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
              Reviews couldn&apos;t be loaded right now. Please refresh to try again.
            </p>
          ) : reviews.length > 0 ? (
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
              {reviews.slice(0, 5).map((r) => (
                <li key={r.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StarRating rating={r.rating} />
                    <p className="font-medium text-stone-900">{propertyTitle(r)}</p>
                    <span className="text-sm text-stone-500">
                      {[r.tenantName, r.createdAt && formatDate(r.createdAt)].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm text-stone-700">{r.comment}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No reviews yet"
              description="Tenants can review a property after their rental is completed."
            />
          )}
        </div>
      </section>
    </div>
  );
}
