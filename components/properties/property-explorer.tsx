"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/field";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  countActiveFilters,
  filterProperties,
  filtersToQuery,
  type PropertyFilters as Filters,
  type SortOption,
} from "@/lib/property-filters";
import type { Property } from "@/lib/types";
import { formatPrice, propertyTypeLabel } from "@/lib/utils";
import { PropertyFilters } from "./property-filters";
import { PropertyGrid } from "./property-grid";

interface PropertyExplorerProps {
  properties: Property[];
  ratings: Record<string, { average: number; count: number }>;
  locations: string[];
  initialFilters: Filters;
}

export function PropertyExplorer({ properties, ratings, locations, initialFilters }: PropertyExplorerProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => filterProperties(properties, filters), [properties, filters]);
  const activeCount = countActiveFilters(filters);

  // Keep the URL shareable without triggering a server round-trip.
  useEffect(() => {
    const query = filtersToQuery(filters);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [filters]);

  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => setFilters({ ...DEFAULT_FILTERS, q: filters.q, sort: filters.sort });

  const chips = activeChips(filters, update);
  const resultLabel = `${results.length} ${results.length === 1 ? "property" : "properties"}`;

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar */}
      <aside aria-label="Filters" className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-xl border border-stone-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="rounded py-0.5 text-sm font-medium text-brand-700 hover:text-brand-800">
                Clear all
              </button>
            )}
          </div>
          <PropertyFilters value={filters} onChange={update} locations={locations} idPrefix="sidebar" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Label htmlFor="keyword" className="sr-only">
              Search properties
            </Label>
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              id="keyword"
              type="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search by keyword, e.g. furnished, lake view"
              className="h-11 pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSheetOpen(true)}
              className="h-11 flex-1 lg:hidden"
              aria-label={`Filters${activeCount ? `, ${activeCount} active` : ""}`}
            >
              <SlidersHorizontal />
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-brand-700 px-1.5 text-xs text-white">{activeCount}</span>
              )}
            </Button>
            <div className="flex-1 sm:w-52 sm:flex-none">
              <Label htmlFor="sort" className="sr-only">
                Sort by
              </Label>
              <Select
                id="sort"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortOption })}
                className="h-11"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Result summary + active filter chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <p aria-live="polite" className="mr-2 text-sm text-stone-600">
            <span className="font-semibold text-stone-900">{resultLabel}</span> found
          </p>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pr-2 pl-3 text-xs font-medium text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
            >
              {chip.label}
              <X aria-hidden className="size-3.5" />
              <span className="sr-only">(remove filter)</span>
            </button>
          ))}
          {chips.length > 1 && (
            <button type="button" onClick={clearAll} className="rounded text-xs font-medium text-stone-600 underline-offset-2 hover:underline">
              Clear all
            </button>
          )}
        </div>

        <div className="mt-6">
          <h2 className="sr-only">Search results</h2>
          {results.length > 0 ? (
            <PropertyGrid properties={results} ratings={ratings} preloadCount={2} />
          ) : (
            <EmptyState
              icon={SearchX}
              title="No properties match your search"
              description="Try a different location, widen your price range or remove a few filters."
              action={
                <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Reset search
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Mobile / tablet filter sheet */}
      <Dialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        variant="sheet"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearAll} className="flex-1" disabled={activeCount === 0}>
              Clear all
            </Button>
            <Button onClick={() => setSheetOpen(false)} className="flex-1">
              Show {resultLabel}
            </Button>
          </div>
        }
      >
        <PropertyFilters value={filters} onChange={update} locations={locations} idPrefix="sheet" />
      </Dialog>
    </div>
  );
}

function activeChips(f: Filters, update: (patch: Partial<Filters>) => void) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (f.location) chips.push({ key: "location", label: f.location, remove: () => update({ location: "" }) });
  if (f.type) chips.push({ key: "type", label: propertyTypeLabel(f.type), remove: () => update({ type: "" }) });
  if (f.minPrice !== null || f.maxPrice !== null) {
    const label =
      f.minPrice !== null && f.maxPrice !== null
        ? `${formatPrice(f.minPrice)} – ${formatPrice(f.maxPrice)}`
        : f.minPrice !== null
          ? `From ${formatPrice(f.minPrice)}`
          : `Up to ${formatPrice(f.maxPrice!)}`;
    chips.push({ key: "price", label, remove: () => update({ minPrice: null, maxPrice: null }) });
  }
  if (f.bedrooms !== null) chips.push({ key: "beds", label: `${f.bedrooms}+ beds`, remove: () => update({ bedrooms: null }) });
  if (f.bathrooms !== null) chips.push({ key: "baths", label: `${f.bathrooms}+ baths`, remove: () => update({ bathrooms: null }) });
  for (const a of f.amenities) {
    chips.push({ key: `amenity-${a}`, label: a, remove: () => update({ amenities: f.amenities.filter((x) => x !== a) }) });
  }
  return chips;
}
