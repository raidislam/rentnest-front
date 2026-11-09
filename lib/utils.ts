import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PROPERTY_TYPES } from "./constants";
import type { PropertyLocation } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const bdt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Formats a BDT amount using South Asian digit grouping, e.g. ৳1,20,000. */
export function formatPrice(amount: number) {
  return `৳${bdt.format(amount)}`;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** "APARTMENT" -> "Apartment". Known types use their label; other backend values are title-cased. */
export function propertyTypeLabel(type: string) {
  const known = PROPERTY_TYPES.find((t) => t.value === type.toUpperCase())?.label;
  if (known) return known;
  return type
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/** Joins the non-empty location parts, e.g. "Dhanmondi, Dhaka" when there is no street address. */
export function formatLocation({ address, area, city }: PropertyLocation) {
  return [address, area, city].filter((part) => part.trim() !== "").join(", ");
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function dashboardPath(role: "TENANT" | "LANDLORD" | "ADMIN") {
  return `/dashboard/${role.toLowerCase()}`;
}

/**
 * next/image only optimizes hosts allowed in next.config.ts. Landlords can paste
 * any image URL, so render other hosts unoptimized instead of failing.
 */
export function isOptimizableImage(src: string) {
  try {
    return new URL(src).hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}
