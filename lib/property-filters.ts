// Property search/filter logic.
//
// Filtering is split between the backend and the browser:
// - GET /api/properties filters by location, minPrice, maxPrice, propertyType
//   and ONE amenity (see toPropertyQueryParams).
// - Keyword search, sorting and any additional amenities are applied in the
//   browser by filterProperties. Running it over already-filtered results is
//   harmless, so the client can also filter instantly while the server catches up.
//
// Bedrooms/bathrooms filters were removed: the backend has no such fields.

import { AMENITIES } from "./constants";
import type { PropertyQueryParams } from "./api/dto";
import type { Property } from "./types";
import { formatLocation } from "./utils";

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface PropertyFilters {
  q: string;
  location: string;
  /** Upper-case property type, e.g. "APARTMENT"; "" = any. */
  type: string;
  minPrice: number | null;
  maxPrice: number | null;
  amenities: string[];
  sort: SortOption;
}

export const DEFAULT_FILTERS: PropertyFilters = {
  q: "",
  location: "",
  type: "",
  minPrice: null,
  maxPrice: null,
  amenities: [],
  sort: "newest",
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function toNumber(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Builds filters from URL search params (also accepts the home page's `price=min-max` preset). */
export function parseFilters(params: RawParams): PropertyFilters {
  const sort = first(params.sort) as SortOption;

  let minPrice = toNumber(first(params.minPrice));
  let maxPrice = toNumber(first(params.maxPrice));
  const preset = first(params.price);
  if (preset.includes("-")) {
    const [min, max] = preset.split("-");
    minPrice = toNumber(min);
    maxPrice = toNumber(max);
  }
  if (minPrice === 0) minPrice = null; // "from ৳0" is the same as no minimum
  // The backend rejects minPrice > maxPrice with a 400; treat that as "no price filter".
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    minPrice = null;
    maxPrice = null;
  }

  const amenityParam = first(params.amenities);
  const amenities = amenityParam
    .split(",")
    .map((a) => a.trim())
    .filter((a) => (AMENITIES as readonly string[]).includes(a));

  return {
    q: first(params.q),
    location: first(params.location).trim(),
    type: first(params.type).trim().toUpperCase(),
    minPrice,
    maxPrice,
    amenities,
    sort: SORT_OPTIONS.some((s) => s.value === sort) ? sort : "newest",
  };
}

/** Serialises filters into a query string, omitting defaults. */
export function filtersToQuery(f: PropertyFilters): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.location) sp.set("location", f.location);
  if (f.type) sp.set("type", f.type);
  if (f.minPrice !== null) sp.set("minPrice", String(f.minPrice));
  if (f.maxPrice !== null) sp.set("maxPrice", String(f.maxPrice));
  if (f.amenities.length) sp.set("amenities", f.amenities.join(","));
  if (f.sort !== "newest") sp.set("sort", f.sort);
  return sp.toString();
}

/** The part of the filters the backend can apply, as GET /api/properties query params. */
export function toPropertyQueryParams(f: PropertyFilters): PropertyQueryParams {
  const params: PropertyQueryParams = {};
  if (f.location.trim()) params.location = f.location.trim();
  if (f.type) params.propertyType = f.type;
  if (f.minPrice !== null) params.minPrice = f.minPrice;
  if (f.maxPrice !== null) params.maxPrice = f.maxPrice;
  // The backend accepts a single amenity; the rest are applied by filterProperties.
  if (f.amenities.length) params.amenity = f.amenities[0];
  return params;
}

/** Query string of only the backend-applied filters; changes to it require a new server fetch. */
export function serverFilterKey(f: PropertyFilters): string {
  return new URLSearchParams(
    Object.entries(toPropertyQueryParams(f)).map(([key, value]) => [key, String(value)]),
  ).toString();
}

const includes = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.trim().toLowerCase());

export function filterProperties(list: Property[], f: PropertyFilters): Property[] {
  const result = list.filter((p) => {
    if (f.q && !includes(`${p.title} ${p.description} ${p.location.area}`, f.q)) return false;
    // Same haystack as the backend: the comma-joined location string, e.g. "Dhanmondi, Dhaka".
    if (f.location && !includes(formatLocation(p.location), f.location)) return false;
    if (f.type && p.type.toUpperCase() !== f.type) return false;
    if (f.minPrice !== null && p.price < f.minPrice) return false;
    if (f.maxPrice !== null && p.price > f.maxPrice) return false;
    if (f.amenities.length && !f.amenities.every((a) => p.amenities.includes(a))) return false;
    return true;
  });

  return result.sort((a, b) => {
    if (f.sort === "price-asc") return a.price - b.price;
    if (f.sort === "price-desc") return b.price - a.price;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/** Number of active (non-default) filters, excluding keyword search and sort. */
export function countActiveFilters(f: PropertyFilters): number {
  return (
    (f.location ? 1 : 0) +
    (f.type ? 1 : 0) +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    f.amenities.length
  );
}
