import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PropertyManager } from "@/components/landlord/property-manager";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/mock-data";

export const metadata: Metadata = { title: "My properties" };

export default function LandlordPropertiesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="My properties"
        description="Edit your listings, control availability and remove properties you no longer rent out."
        actions={
          <Link href="/dashboard/landlord/properties/new" className={buttonVariants()}>
            <Plus />
            Add property
          </Link>
        }
      />
      <PropertyManager landlordId={getCurrentUser("LANDLORD").id} />
    </div>
  );
}
