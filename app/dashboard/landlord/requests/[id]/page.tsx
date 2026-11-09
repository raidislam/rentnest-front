import type { Metadata } from "next";
import { LandlordRequestDetail } from "@/components/landlord/landlord-request-detail";
import { getCurrentUser } from "@/lib/mock-data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Rental request" };

export default async function LandlordRequestPage({ params }: PageProps<"/dashboard/landlord/requests/[id]">) {
  await requireUser("LANDLORD");
  const { id } = await params;
  return <LandlordRequestDetail landlordId={getCurrentUser("LANDLORD").id} requestId={id} />;
}
