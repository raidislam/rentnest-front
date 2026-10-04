"use client";

import Link from "next/link";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import { Building2, Plus, Search, SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { MockApiError, setPropertyAvailability } from "@/lib/mock-api";
import { useLandlordProperties, useLandlordRequests } from "@/lib/mock-store";
import type { Property } from "@/lib/types";
import { DeletePropertyDialog } from "./delete-property-dialog";
import { LandlordPropertyCard } from "./landlord-property-card";

type AvailabilityFilter = "ALL" | "AVAILABLE" | "UNAVAILABLE";

const FILTERS: { value: AvailabilityFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

export function PropertyManager({ landlordId }: { landlordId: string }) {
  const toast = useToast();
  const properties = useLandlordProperties(landlordId);
  const requests = useLandlordRequests(landlordId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AvailabilityFilter>("ALL");
  const [toDelete, setToDelete] = useState<Property | null>(null);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  // Availability flips immediately; it reverts automatically if the mock request fails.
  const [optimisticProperties, setOptimisticAvailability] = useOptimistic(
    properties,
    (state, update: { id: string; isAvailable: boolean }) =>
      state.map((p) => (p.id === update.id ? { ...p, isAvailable: update.isAvailable } : p)),
  );

  const requestCounts = useMemo(() => {
    const counts = new Map<string, { total: number; pending: number }>();
    for (const r of requests) {
      const c = counts.get(r.propertyId) ?? { total: 0, pending: 0 };
      c.total += 1;
      if (r.status === "PENDING") c.pending += 1;
      counts.set(r.propertyId, c);
    }
    return counts;
  }, [requests]);

  const toggleAvailability = (property: Property, next: boolean) => {
    setToggling((s) => new Set(s).add(property.id));
    startTransition(async () => {
      setOptimisticAvailability({ id: property.id, isAvailable: next });
      try {
        await setPropertyAvailability(property.id, next);
        toast({
          title: next ? "Marked as available" : "Marked as unavailable",
          description: next ? "Renters can send requests for this property again." : "Renters can no longer send new requests.",
        });
      } catch (err) {
        toast({
          title: "Couldn't update availability",
          description: err instanceof MockApiError ? err.message : "Please try again.",
          variant: "error",
        });
      } finally {
        setToggling((s) => {
          const nextSet = new Set(s);
          nextSet.delete(property.id);
          return nextSet;
        });
      }
    });
  };

  const q = query.trim().toLowerCase();
  const visible = optimisticProperties.filter((p) => {
    if (filter === "AVAILABLE" && !p.isAvailable) return false;
    if (filter === "UNAVAILABLE" && p.isAvailable) return false;
    return !q || `${p.title} ${p.location.area} ${p.location.city}`.toLowerCase().includes(q);
  });

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="You haven't listed any properties yet"
        description="Add your first property with photos, rent and amenities. Our team reviews new listings before they go live."
        action={
          <Link href="/dashboard/landlord/properties/new" className={buttonVariants()}>
            <Plus />
            Add property
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Label htmlFor="property-search" className="sr-only">
            Search your properties
          </Label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            id="property-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or area"
            className="pl-9"
          />
        </div>
        <FilterChips
          label="Filter by availability"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({
            ...f,
            count:
              f.value === "ALL"
                ? optimisticProperties.length
                : optimisticProperties.filter((p) => p.isAvailable === (f.value === "AVAILABLE")).length,
          }))}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {visible.length} of {optimisticProperties.length} properties
      </p>

      <h2 className="sr-only">Your listings</h2>
      {visible.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((property) => {
            const counts = requestCounts.get(property.id) ?? { total: 0, pending: 0 };
            return (
              <li key={property.id} className="flex [&>*]:w-full">
                <LandlordPropertyCard
                  property={property}
                  requestCount={counts.total}
                  pendingCount={counts.pending}
                  togglingAvailability={toggling.has(property.id)}
                  onToggleAvailability={(next) => toggleAvailability(property, next)}
                  onDelete={() => setToDelete(property)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No properties match"
          description="Try a different search term or availability filter."
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
      )}

      <DeletePropertyDialog
        property={toDelete}
        requestCount={toDelete ? (requestCounts.get(toDelete.id)?.total ?? 0) : 0}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
