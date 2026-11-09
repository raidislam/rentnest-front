import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/properties/property-explorer";
import { PageHeader } from "@/components/shared/page-header";
import { getPublicServerApi } from "@/lib/api/server";
import { listCategories } from "@/lib/api/services/categories";
import { listProperties } from "@/lib/api/services/properties";
import { parseFilters, toPropertyQueryParams } from "@/lib/property-filters";
import { categoryTypeOptions, locationOptions } from "@/lib/property-insights";

export const metadata: Metadata = {
  title: "Browse rental properties",
  description: "Search and filter verified rental properties by location, price, type and amenities.",
};

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  // Reading searchParams already makes this page render per request.
  const initialFilters = parseFilters(await searchParams);

  const api = getPublicServerApi();
  // GET /api/properties applies location, type, price and one amenity; the explorer
  // applies keyword search, sorting and any extra amenities in the browser.
  const [properties, categories] = await Promise.all([
    listProperties(api, toPropertyQueryParams(initialFilters)),
    listCategories(api),
  ]);

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title="Rental properties"
        description="Browse verified homes and narrow results by location, budget, type and amenities."
      />
      <div className="mt-8">
        <PropertyExplorer
          properties={properties}
          // The list endpoint doesn't include reviews, so cards show no rating.
          ratings={{}}
          locations={locationOptions(properties)}
          typeOptions={categoryTypeOptions(categories)}
          initialFilters={initialFilters}
        />
      </div>
    </div>
  );
}
