"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2, Check, Eye, LoaderCircle, SearchX, X } from "lucide-react";
import { shouldSimulateFailure, useOptimisticPatch, type WithSaving } from "@/components/dashboard/use-optimistic-patch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { PropertyStatusBadge } from "@/components/shared/moderation-badges";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { MockApiError, updatePropertyModerationStatus } from "@/lib/mock-api";
import { useAdminProperties } from "@/lib/mock-store";
import type { AdminPropertyView, PropertyStatus } from "@/lib/types";
import { formatDate, formatPrice, isOptimizableImage } from "@/lib/utils";
import { PropertyReviewDialog } from "./property-review-dialog";

export type PropertyFilter = PropertyStatus | "ALL";
type Row = WithSaving<AdminPropertyView>;

const FILTER_LABELS: Record<PropertyFilter, string> = {
  ALL: "All",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const emptyCopy: Record<PropertyFilter, string> = {
  ALL: "Listings appear here as landlords add them.",
  PENDING: "You're all caught up — no listings are waiting for review.",
  APPROVED: "No listings have been approved yet.",
  REJECTED: "No listings have been rejected.",
};

export function PropertyModeration({ initialFilter = "ALL" }: { initialFilter?: PropertyFilter }) {
  const toast = useToast();
  const [properties, run] = useOptimisticPatch(useAdminProperties());
  const [filter, setFilter] = useState<PropertyFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminPropertyView | null>(null);

  // Read the live (optimistic) row so the dialog reflects decisions immediately.
  const reviewing = properties.find((p) => p.id === reviewingId) ?? null;

  const q = query.trim().toLowerCase();
  const matchesSearch = (p: AdminPropertyView) =>
    !q ||
    [p.title, p.landlord?.name ?? "", p.location.area, p.location.city, p.location.address].some((v) => v.toLowerCase().includes(q));
  const searched = properties.filter(matchesSearch);
  // Pending listings first; keep a row in view while its new status is saving.
  const visible = searched
    .filter((p) => filter === "ALL" || p.status === filter || p.saving)
    .sort((a, b) => Number(b.status === "PENDING") - Number(a.status === "PENDING"));

  const decide = (property: AdminPropertyView, status: "APPROVED" | "REJECTED", note?: string) => {
    const simulateFailure = shouldSimulateFailure();
    run(property.id, { status, moderationNote: note || undefined }, () => updatePropertyModerationStatus(property.id, status, { note, simulateFailure }), {
      onSuccess: () =>
        toast(
          status === "APPROVED"
            ? { title: "Listing approved", description: `“${property.title}” is now visible to renters.` }
            : { title: "Listing rejected", description: `${property.landlord?.name ?? "The landlord"} can see that it wasn't approved.` },
        ),
      onError: (err) =>
        toast({
          title: status === "APPROVED" ? "Couldn't approve listing" : "Couldn't reject listing",
          description: `${err instanceof MockApiError ? err.message : "Something went wrong."} It's still pending review.`,
          variant: "error",
        }),
    });
  };

  const options = (Object.keys(FILTER_LABELS) as PropertyFilter[]).map((f) => ({
    value: f,
    label: FILTER_LABELS[f],
    count: f === "ALL" ? searched.length : searched.filter((p) => p.status === f).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchInput
          label="Search listings"
          placeholder="Search by title, landlord or location"
          value={query}
          onChange={setQuery}
          className="xl:w-96"
        />
        <FilterChips label="Filter by moderation status" options={options} value={filter} onChange={setFilter} />
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} listings shown
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={q ? SearchX : Building2}
          title={
            searched.length === 0
              ? "No listings match your search"
              : `No ${FILTER_LABELS[filter].toLowerCase()} listings${q ? " match your search" : ""}`
          }
          description={searched.length === 0 ? "Try a different title, landlord name or area." : emptyCopy[filter]}
          action={
            q || filter !== "ALL" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setFilter("ALL");
                }}
              >
                Show all listings
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-medium tracking-wide text-stone-500 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Property</th>
                  <th scope="col" className="px-4 py-3 text-right">Rent</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60">
                    <td className="w-full max-w-0 px-4 py-3">
                      <PropertyCell property={p} detailed />
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-stone-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <StatusCell property={p} />
                    </td>
                    <td className="px-4 py-3">
                      <Actions property={p} onReview={() => setReviewingId(p.id)} onApprove={() => decide(p, "APPROVED")} onReject={() => setRejecting(p)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
            {visible.map((p) => (
              <li key={p.id} className="rounded-xl border border-stone-200 bg-white p-4">
                <PropertyCell property={p} />
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  <StatusCell property={p} />
                  <span className="font-medium text-stone-900">{formatPrice(p.price)}/mo</span>
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {p.landlord?.name ?? "Unknown landlord"} · submitted {formatDate(p.createdAt)}
                </p>
                <div className="mt-4">
                  <Actions property={p} stacked onReview={() => setReviewingId(p.id)} onApprove={() => decide(p, "APPROVED")} onReject={() => setRejecting(p)} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <PropertyReviewDialog
        property={reviewing}
        onClose={() => setReviewingId(null)}
        onApprove={(p) => decide(p, "APPROVED")}
        onReject={(p) => setRejecting(p)}
      />

      <ConfirmDialog
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={(note) => {
          if (rejecting) decide(rejecting, "REJECTED", note);
          setRejecting(null);
        }}
        title="Reject this listing?"
        subtitle={rejecting?.title}
        confirmLabel="Reject listing"
        confirmIcon={<X />}
        noteLabel="Reason (optional, shown to the landlord)"
        notePlaceholder="e.g. Photos are unclear — please add photos of each room."
      >
        <p>The listing won&apos;t be published. The landlord will see that it wasn&apos;t approved, along with your reason.</p>
      </ConfirmDialog>
    </div>
  );
}

function PropertyCell({ property, detailed = false }: { property: Row; detailed?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        <Image src={property.images[0]} alt="" fill sizes="48px" unoptimized={!isOptimizableImage(property.images[0])} className="object-cover" />
      </div>
      <div className="min-w-0">
        <p className="line-clamp-1 font-medium text-stone-900">{property.title}</p>
        <p className="truncate text-sm text-stone-500">
          {property.location.area}, {property.location.city} · {property.isAvailable ? "Available" : "Unavailable"}
        </p>
        {detailed && (
          <p className="truncate text-sm text-stone-500">
            {property.landlord?.name ?? "Unknown landlord"} · submitted {formatDate(property.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusCell({ property }: { property: Row }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <PropertyStatusBadge status={property.status} />
      {property.saving && (
        <span role="status" className="flex items-center gap-1 text-xs text-stone-500">
          <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
          Saving…
        </span>
      )}
    </span>
  );
}

function Actions({
  property,
  onReview,
  onApprove,
  onReject,
  stacked = false,
}: {
  property: Row;
  onReview: () => void;
  onApprove: () => void;
  onReject: () => void;
  stacked?: boolean;
}) {
  const pending = property.status === "PENDING" && !property.saving;
  return (
    <div className={stacked ? (pending ? "grid grid-cols-3 gap-2" : "grid") : "flex justify-end gap-2"}>
      <Button variant="outline" size="sm" onClick={onReview}>
        <Eye />
        Review
        <span className="sr-only">{property.title}</span>
      </Button>
      {pending && (
        <>
          <Button size="sm" onClick={onApprove} aria-label={`Approve ${property.title}`}>
            <Check />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            aria-label={`Reject ${property.title}`}
            className="text-red-700 hover:border-red-300 hover:bg-red-50"
          >
            <X />
            Reject
          </Button>
        </>
      )}
    </div>
  );
}
