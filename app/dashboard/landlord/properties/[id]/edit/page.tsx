import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { EditPropertyView } from "@/components/landlord/edit-property-view";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getCategories, getMyProperties } from "@/lib/api/landlord";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit property" };

export default async function EditPropertyPage({ params }: PageProps<"/dashboard/landlord/properties/[id]/edit">) {
  await requireUser("LANDLORD");
  const { id } = await params;
  // There is no single-property landlord endpoint: look it up in the landlord's own list,
  // which also guarantees the property belongs to this landlord.
  const [properties, categories] = await Promise.all([getMyProperties(), getCategories()]);
  const property = properties.find((p) => p.id === id);

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

  return <EditPropertyView property={property} categories={categories} />;
}
