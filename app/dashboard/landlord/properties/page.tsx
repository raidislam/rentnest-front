import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PropertyManager } from "@/components/landlord/property-manager";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getPropertiesAndRequests } from "@/lib/api/landlord";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My properties" };

export default async function LandlordPropertiesPage() {
  await requireUser("LANDLORD");
  const { properties, requests } = await getPropertiesAndRequests();
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
      <PropertyManager initialProperties={properties} requests={requests} />
    </div>
  );
}
