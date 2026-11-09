import type { Metadata } from "next";
import { RequestManager } from "@/components/landlord/request-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getPropertiesAndRequests } from "@/lib/api/landlord";
import { requireUser } from "@/lib/auth/session";
import { REQUEST_STATUSES } from "@/lib/constants";
import type { RequestStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Rental requests" };

export default async function LandlordRequestsPage({ searchParams }: PageProps<"/dashboard/landlord/requests">) {
  await requireUser("LANDLORD");
  const { status } = await searchParams;
  const initialFilter = REQUEST_STATUSES.includes(status as RequestStatus) ? (status as RequestStatus) : "ALL";
  const { requests } = await getPropertiesAndRequests();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rental requests"
        description="Review requests for your properties. Approved tenants can then pay to confirm their rental."
      />
      <RequestManager initialRequests={requests} initialFilter={initialFilter} />
    </div>
  );
}
