// Derived, read-only views over property data fetched from the API.
// The backend has no endpoints for these (featured, popular areas, similar
// homes, ratings), so they are computed from GET /api/properties results.
// Pure functions: safe on server and client.

import type { MappedCategory } from "./api/mappers";
import type { Property } from "./types";

export const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt);

/** Most recently listed available properties (the backend has no "featured" flag). */
export function latestProperties<T extends Property>(list: T[], limit: number): T[] {
  return list
    .filter((p) => p.isAvailable)
    .sort(newestFirst)
    .slice(0, limit);
}

export interface PopularArea {
  area: string;
  city: string;
  count: number;
  image: string;
}

/** Distinct areas with listing counts, most listings first. Properties without an area are skipped. */
export function popularAreas(list: Property[]): PopularArea[] {
  const map = new Map<string, PopularArea>();
  for (const p of list) {
    const { area, city } = p.location;
    if (!area) continue;
    const entry = map.get(area);
    if (entry) entry.count += 1;
    else map.set(area, { area, city, count: 1, image: p.images[0] });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Distinct areas and cities for location autocomplete. */
export function locationOptions(list: Property[]): string[] {
  const set = new Set<string>();
  for (const p of list) {
    if (p.location.area) set.add(p.location.area);
    if (p.location.city) set.add(p.location.city);
  }
  return [...set].sort();
}

/** Other available homes in the same city, closest in price first. */
export function similarProperties<T extends Property>(property: Property, list: T[], limit = 3): T[] {
  const city = property.location.city.toLowerCase();
  return list
    .filter((p) => p.id !== property.id && p.isAvailable && city !== "" && p.location.city.toLowerCase() === city)
    .sort((a, b) => Math.abs(a.price - property.price) - Math.abs(b.price - property.price))
    .slice(0, limit);
}

export interface RatingSummary {
  average: number;
  count: number;
}

/** Average rating rounded to one decimal place. */
export function ratingSummary(reviews: { rating: number }[]): RatingSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

export interface TypeOption {
  /** Upper-case, matches the backend's propertyType (case-insensitive filter). */
  value: string;
  label: string;
}

/** Property type choices from GET /api/categories, e.g. { value: "APARTMENT", label: "Apartment" }. */
export function categoryTypeOptions(categories: MappedCategory[]): TypeOption[] {
  return categories.map((c) => ({ value: c.name.toUpperCase(), label: c.name }));
}
