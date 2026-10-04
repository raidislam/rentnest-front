import type { Metadata } from "next";
import { RequestModeration } from "@/components/admin/request-moderation";
import { PageHeader } from "@/components/shared/page-header";
import { REQUEST_STATUSES } from "@/lib/constants";
import type { RequestStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Rental requests" };

export default async function AdminRequestsPage({ searchParams }: PageProps<"/dashboard/admin/requests">) {
  const { status } = await searchParams;
  const initialFilter = REQUEST_STATUSES.includes(status as RequestStatus) ? (status as RequestStatus) : "ALL";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rental requests"
        description="All rental requests across RentNest. Landlords make the decisions; you can inspect any request."
      />
      <RequestModeration initialFilter={initialFilter} />
    </div>
  );
}
