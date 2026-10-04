import type { Metadata } from "next";
import { PropertyModeration, type PropertyFilter } from "@/components/admin/property-moderation";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Property moderation" };

const FILTERS: PropertyFilter[] = ["PENDING", "APPROVED", "REJECTED"];

export default async function AdminPropertiesPage({ searchParams }: PageProps<"/dashboard/admin/properties">) {
  const { status } = await searchParams;
  const initialFilter = FILTERS.includes(status as PropertyFilter) ? (status as PropertyFilter) : "ALL";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Properties"
        description="Review new listings before they appear in search, and inspect existing ones."
      />
      <PropertyModeration initialFilter={initialFilter} />
    </div>
  );
}
