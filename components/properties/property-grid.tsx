import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PropertyCard } from "./property-card";

interface PropertyGridProps {
  properties: Property[];
  ratings?: Record<string, { average: number; count: number }>;
  /** Number of leading cards whose images should be preloaded. */
  preloadCount?: number;
  className?: string;
}

export function PropertyGrid({ properties, ratings, preloadCount = 0, className }: PropertyGridProps) {
  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {properties.map((property, i) => (
        <li key={property.id} className="flex">
          <PropertyCard
            property={property}
            rating={ratings?.[property.id]}
            preload={i < preloadCount}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
