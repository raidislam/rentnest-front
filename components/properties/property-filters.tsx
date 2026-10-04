"use client";

import { useId, useState } from "react";
import { MapPin } from "lucide-react";
import { Input, Label } from "@/components/ui/field";
import { AMENITIES, PRICE_RANGES, PROPERTY_TYPES } from "@/lib/constants";
import type { PropertyFilters as Filters } from "@/lib/property-filters";
import type { Amenity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PropertyFiltersProps {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
  locations: string[];
  /** Prefix for element ids so the panel can render twice (sidebar + mobile sheet). */
  idPrefix: string;
}

export function PropertyFilters({ value, onChange, locations, idPrefix }: PropertyFiltersProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const visibleAmenities = showAllAmenities ? AMENITIES : AMENITIES.slice(0, 6);
  const activePreset = PRICE_RANGES.find((r) => {
    const [min, max] = r.value.split("-");
    return (value.minPrice ?? 0) === Number(min) && (value.maxPrice === null ? max === "" : value.maxPrice === Number(max));
  })?.value;

  const toggleAmenity = (amenity: Amenity) =>
    onChange({
      amenities: value.amenities.includes(amenity)
        ? value.amenities.filter((a) => a !== amenity)
        : [...value.amenities, amenity],
    });

  const parsePrice = (raw: string) => (raw === "" ? null : Math.max(0, Number(raw)));

  return (
    <div className="space-y-7">
      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-location`}>Location</Label>
        <div className="relative">
          <MapPin aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            id={`${idPrefix}-location`}
            list={`${idPrefix}-location-options`}
            value={value.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Area or city"
            autoComplete="off"
            className="pl-9"
          />
          <datalist id={`${idPrefix}-location-options`}>
            {locations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Property type */}
      <ChipGroup
        legend="Property type"
        name={`${idPrefix}-type`}
        options={[{ value: "", label: "Any" }, ...PROPERTY_TYPES]}
        value={value.type}
        onChange={(type) => onChange({ type: type as Filters["type"] })}
      />

      {/* Price */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-stone-800">Monthly rent (৳)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`${idPrefix}-min`} className="sr-only">
              Minimum rent
            </Label>
            <Input
              id={`${idPrefix}-min`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="Min"
              value={value.minPrice ?? ""}
              onChange={(e) => onChange({ minPrice: parsePrice(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-max`} className="sr-only">
              Maximum rent
            </Label>
            <Input
              id={`${idPrefix}-max`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="Max"
              value={value.maxPrice ?? ""}
              onChange={(e) => onChange({ maxPrice: parsePrice(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((r) => {
            const [min, max] = r.value.split("-");
            const active = activePreset === r.value;
            return (
              <button
                key={r.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange(
                    active
                      ? { minPrice: null, maxPrice: null }
                      : { minPrice: Number(min) || null, maxPrice: max ? Number(max) : null },
                  )
                }
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-stone-300 text-stone-600 hover:border-stone-400",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Bedrooms / bathrooms */}
      <ChipGroup
        legend="Bedrooms"
        name={`${idPrefix}-bedrooms`}
        options={[{ value: "", label: "Any" }, ...[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+` }))]}
        value={value.bedrooms === null ? "" : String(value.bedrooms)}
        onChange={(v) => onChange({ bedrooms: v === "" ? null : Number(v) })}
      />
      <ChipGroup
        legend="Bathrooms"
        name={`${idPrefix}-bathrooms`}
        options={[{ value: "", label: "Any" }, ...[1, 2, 3].map((n) => ({ value: String(n), label: `${n}+` }))]}
        value={value.bathrooms === null ? "" : String(value.bathrooms)}
        onChange={(v) => onChange({ bathrooms: v === "" ? null : Number(v) })}
      />

      {/* Amenities */}
      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Amenities</legend>
        <div className="mt-3 space-y-2.5">
          {visibleAmenities.map((amenity) => {
            const id = `${idPrefix}-amenity-${amenity.replace(/\W+/g, "-")}`;
            return (
              <div key={amenity} className="flex items-center gap-2.5">
                <input
                  id={id}
                  type="checkbox"
                  checked={value.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="size-4 rounded border-stone-300 accent-brand-700"
                />
                <label htmlFor={id} className="text-sm text-stone-700">
                  {amenity}
                </label>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowAllAmenities((v) => !v)}
          className="mt-3 rounded text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          {showAllAmenities ? "Show fewer" : `Show all ${AMENITIES.length} amenities`}
        </button>
      </fieldset>
    </div>
  );
}

interface ChipGroupProps {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

/** Single-select group rendered as chips, backed by native radio inputs for keyboard + screen reader support. */
function ChipGroup({ legend, name, options, value, onChange }: ChipGroupProps) {
  const groupId = useId();
  return (
    <fieldset>
      <legend className="text-sm font-medium text-stone-800">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const id = `${groupId}-${opt.value || "any"}`;
          return (
            <div key={opt.value}>
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center rounded-full border border-stone-300 px-3 text-sm text-stone-700 transition-colors hover:border-stone-400",
                  "peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:font-medium peer-checked:text-brand-800",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600",
                )}
              >
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
