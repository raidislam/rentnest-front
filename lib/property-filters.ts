// Property search/filter logic. Runs against mock data for now; the same
// PropertyFilters shape maps directly to query params for GET /api/properties.

import { AMENITIES, PROPERTY_TYPES } from "./constants";
import type { Amenity, Property, PropertyType } from "./types";

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface PropertyFilters {
  q: string;
  location: string;
  type: PropertyType | "";
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null; // minimum
  bathrooms: number | null; // minimum
  amenities: Amenity[];
  sort: SortOption;
}

export const DEFAULT_FILTERS: PropertyFilters = {
  q: "",
  location: "",
  type: "",
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  bathrooms: null,
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
  const type = first(params.type).toUpperCase();
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

  const amenityParam = first(params.amenities);
  const amenities = amenityParam
    .split(",")
    .map((a) => a.trim())
    .filter((a): a is Amenity => (AMENITIES as string[]).includes(a));

  return {
    q: first(params.q),
    location: first(params.location),
    type: PROPERTY_TYPES.some((t) => t.value === type) ? (type as PropertyType) : "",
    minPrice,
    maxPrice,
    bedrooms: toNumber(first(params.bedrooms)),
    bathrooms: toNumber(first(params.bathrooms)),
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
  if (f.bedrooms !== null) sp.set("bedrooms", String(f.bedrooms));
  if (f.bathrooms !== null) sp.set("bathrooms", String(f.bathrooms));
  if (f.amenities.length) sp.set("amenities", f.amenities.join(","));
  if (f.sort !== "newest") sp.set("sort", f.sort);
  return sp.toString();
}

const includes = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.trim().toLowerCase());

export function filterProperties(list: Property[], f: PropertyFilters): Property[] {
  const result = list.filter((p) => {
    if (f.q && !includes(`${p.title} ${p.description} ${p.location.area}`, f.q)) return false;
    if (f.location && !includes(`${p.location.address} ${p.location.area} ${p.location.city}`, f.location)) return false;
    if (f.type && p.type !== f.type) return false;
    if (f.minPrice !== null && p.price < f.minPrice) return false;
    if (f.maxPrice !== null && p.price > f.maxPrice) return false;
    if (f.bedrooms !== null && p.bedrooms < f.bedrooms) return false;
    if (f.bathrooms !== null && p.bathrooms < f.bathrooms) return false;
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
    (f.bedrooms !== null ? 1 : 0) +
    (f.bathrooms !== null ? 1 : 0) +
    f.amenities.length
  );
}
