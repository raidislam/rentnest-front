import type { Metadata } from "next";
import { AdminPropertyList, type AvailabilityFilter } from "@/components/admin/property-moderation";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminProperties } from "@/lib/api/admin";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Properties" };

const FILTERS: AvailabilityFilter[] = ["AVAILABLE", "UNAVAILABLE"];

export default async function AdminPropertiesPage({ searchParams }: PageProps<"/dashboard/admin/properties">) {
  await requireUser("ADMIN");
  const { availability } = await searchParams;
  const initialFilter = FILTERS.includes(availability as AvailabilityFilter) ? (availability as AvailabilityFilter) : "ALL";
  const properties = await getAdminProperties();

  return (
    <div className="space-y-8">
      <PageHeader title="Properties" description="Every listing on RentNest, including unavailable ones. Landlords manage their own listings." />
      <AdminPropertyList properties={properties} initialFilter={initialFilter} />
    </div>
  );
}
