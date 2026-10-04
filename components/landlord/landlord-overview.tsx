"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CircleCheck, ClipboardList, Hourglass, Inbox, Plus, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useLandlordProperties, useLandlordRequests } from "@/lib/mock-store";
import { formatPrice, isOptimizableImage } from "@/lib/utils";
import { LandlordRequestTable } from "./landlord-request-table";

interface LandlordOverviewProps {
  landlordId: string;
  firstName: string;
  /** Total of paid rent across the landlord's rentals (from GET /api/payments later). */
  totalEarnings: number;
}

export function LandlordOverview({ landlordId, firstName, totalEarnings }: LandlordOverviewProps) {
  const properties = useLandlordProperties(landlordId);
  const requests = useLandlordRequests(landlordId);
  const pending = requests.filter((r) => r.status === "PENDING");
  const available = properties.filter((p) => p.isAvailable).length;
  const requestCount = (propertyId: string) => requests.filter((r) => r.propertyId === propertyId).length;

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
        <StatCard label="Available" value={available} icon={CircleCheck} tone="brand" hint="Accepting requests" />
        <StatCard label="Pending requests" value={pending.length} icon={Hourglass} tone="amber" hint="Awaiting your decision" />
        <StatCard label="Total earnings" value={formatPrice(totalEarnings)} icon={Wallet} tone="blue" hint="Rent received" />
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
                      <Image src={p.images[0]} alt="" fill sizes="56px" unoptimized={!isOptimizableImage(p.images[0])} className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="line-clamp-1 font-medium text-stone-900">{p.title}</p>
                      <p className="text-sm text-stone-500">
                        {p.location.area}, {p.location.city} · {formatPrice(p.price)}/mo
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={p.isAvailable ? "brand" : "neutral"}>{p.isAvailable ? "Available" : "Unavailable"}</Badge>
                      {p.status === "PENDING" && <Badge tone="amber">Pending review</Badge>}
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
    </div>
  );
}
