import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/landlord/property-form";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Add property" };

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/landlord/properties"
        className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        My properties
      </Link>
      <PageHeader
        title="Add a property"
        description="New listings are reviewed by the RentNest team before they appear in search."
      />
      <PropertyForm landlordId={getCurrentUser("LANDLORD").id} />
    </div>
  );
}
