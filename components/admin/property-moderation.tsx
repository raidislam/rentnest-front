"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2, Eye, SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MappedProperty } from "@/lib/api/mappers";
import { formatDate, formatLocation, formatPrice } from "@/lib/utils";
import { PropertyReviewDialog } from "./property-review-dialog";

export type AvailabilityFilter = "ALL" | "AVAILABLE" | "UNAVAILABLE";

const FILTERS: { value: AvailabilityFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

/**
 * Read-only list of every property (GET /api/admin/properties). The backend has no property
 * moderation endpoint, so there are no approve/reject actions; landlords manage their own listings.
 */
export function AdminPropertyList({ properties, initialFilter = "ALL" }: { properties: MappedProperty[]; initialFilter?: AvailabilityFilter }) {
  const [filter, setFilter] = useState<AvailabilityFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<MappedProperty | null>(null);

  const q = query.trim().toLowerCase();
  const searched = properties.filter(
    (p) => !q || [p.title, p.landlord?.name ?? "", p.landlord?.email ?? "", formatLocation(p.location)].some((v) => v.toLowerCase().includes(q)),
  );
  const visible = searched.filter((p) => filter === "ALL" || p.isAvailable === (filter === "AVAILABLE"));

  const options = FILTERS.map((f) => ({
    ...f,
    count: f.value === "ALL" ? searched.length : searched.filter((p) => p.isAvailable === (f.value === "AVAILABLE")).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchInput label="Search properties" placeholder="Search by title, landlord or area" value={query} onChange={setQuery} className="xl:w-80" />
        <FilterChips label="Filter by availability" options={options} value={filter} onChange={setFilter} />
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} properties shown
      </p>

      {properties.length === 0 ? (
        <EmptyState icon={Building2} title="No properties yet" description="Listings appear here as landlords add them." />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No properties match"
          description="Try a different search or availability filter."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
          {visible.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 basis-60">
                <p className="line-clamp-1 font-medium text-stone-900">{p.title}</p>
                <p className="text-sm text-stone-500">
                  {[p.landlord?.name, formatLocation({ ...p.location, address: "" }), `${formatPrice(p.price)}/mo`].filter(Boolean).join(" · ")}
                </p>
                <p className="text-xs text-stone-500">
                  {[p.category?.name, `Listed ${formatDate(p.createdAt)}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Badge tone={p.isAvailable ? "brand" : "neutral"}>{p.isAvailable ? "Available" : "Unavailable"}</Badge>
              <Button variant="outline" size="sm" onClick={() => setViewing(p)} className="w-full sm:w-auto">
                <Eye />
                View
                <span className="sr-only">{p.title}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <PropertyReviewDialog property={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
