import type { Metadata } from "next";
import { RequestManager } from "@/components/landlord/request-manager";
import { PageHeader } from "@/components/shared/page-header";
import { REQUEST_STATUSES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/mock-data";
import type { RequestStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Rental requests" };

export default async function LandlordRequestsPage({ searchParams }: PageProps<"/dashboard/landlord/requests">) {
  const { status } = await searchParams;
  const initialFilter = REQUEST_STATUSES.includes(status as RequestStatus) ? (status as RequestStatus) : "ALL";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rental requests"
        description="Review requests for your properties. Approved tenants can then pay to confirm their rental."
      />
      <RequestManager landlordId={getCurrentUser("LANDLORD").id} initialFilter={initialFilter} />
    </div>
  );
}
