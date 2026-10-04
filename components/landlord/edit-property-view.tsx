"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useLandlordProperties } from "@/lib/mock-store";
import { PropertyForm } from "./property-form";

/** Loads the landlord's property from the mock store (so session-created listings are editable too). */
export function EditPropertyView({ landlordId, propertyId }: { landlordId: string; propertyId: string }) {
  const property = useLandlordProperties(landlordId).find((p) => p.id === propertyId);

  if (!property) {
    return (
      <EmptyState
        icon={SearchX}
        as="h1"
        title="We couldn't find that property"
        description="It may have been deleted, or it isn't one of your listings."
        className="mx-auto mt-8 max-w-lg"
        action={
          <Link href="/dashboard/landlord/properties" className={buttonVariants()}>
            Back to my properties
          </Link>
        }
      />
    );
  }

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
      <PropertyForm key={property.id} landlordId={landlordId} property={property} />
    </div>
  );
}
