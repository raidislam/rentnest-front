import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import type { MappedCategory, MappedProperty } from "@/lib/api/mappers";
import { PropertyForm } from "./property-form";

/** Edit page body. The property comes from GET /api/landlord/properties (so it's always the landlord's own). */
export function EditPropertyView({ property, categories }: { property: MappedProperty; categories: MappedCategory[] }) {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/landlord/properties"
        className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        My properties
      </Link>
      <PageHeader title="Edit property" description={property.title} />
      <PropertyForm key={property.id} property={property} categories={categories} />
    </div>
  );
}
