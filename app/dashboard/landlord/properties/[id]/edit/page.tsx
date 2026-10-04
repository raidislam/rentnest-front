import type { Metadata } from "next";
import { EditPropertyView } from "@/components/landlord/edit-property-view";
import { getCurrentUser } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Edit property" };

export default async function EditPropertyPage({ params }: PageProps<"/dashboard/landlord/properties/[id]/edit">) {
  const { id } = await params;
  return <EditPropertyView landlordId={getCurrentUser("LANDLORD").id} propertyId={id} />;
}
