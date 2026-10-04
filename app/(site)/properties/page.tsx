import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/properties/property-explorer";
import { PageHeader } from "@/components/shared/page-header";
import { getLocationOptions, getPropertyRating, getPublicProperties } from "@/lib/mock-data";
import { filtersToQuery, parseFilters } from "@/lib/property-filters";

export const metadata: Metadata = {
  title: "Browse rental properties",
  description: "Search and filter verified rental properties by location, price, type and amenities.",
};

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  const initialFilters = parseFilters(await searchParams);
  // Future: GET /api/properties?{filters}
  const properties = getPublicProperties();
  const ratings = Object.fromEntries(properties.map((p) => [p.id, getPropertyRating(p.id)]));

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title="Rental properties"
        description="Browse verified homes and narrow results by location, budget, type and amenities."
      />
      <div className="mt-8">
        {/* Re-mount when a link navigates here with new params, e.g. from the footer. */}
        <PropertyExplorer
          key={filtersToQuery(initialFilters)}
          properties={properties}
          ratings={ratings}
          locations={getLocationOptions()}
          initialFilters={initialFilters}
        />
      </div>
    </div>
  );
}
