import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RequestHistory } from "@/components/tenant/request-history";
import { buttonVariants } from "@/components/ui/button";
import { REQUEST_STATUSES } from "@/lib/constants";
import { getCurrentUser, getTenantRequests } from "@/lib/mock-data";
import type { RequestStatus } from "@/lib/types";

export const metadata: Metadata = { title: "My rental requests" };

export default async function TenantRequestsPage({ searchParams }: PageProps<"/dashboard/tenant/requests">) {
  const { status } = await searchParams;
  const initialFilter = REQUEST_STATUSES.includes(status as RequestStatus) ? (status as RequestStatus) : "ALL";
  // Future: GET /api/rentals
  const requests = getTenantRequests(getCurrentUser("TENANT").id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="My rental requests"
        description="Every request you've sent, with its current status and next step."
        actions={
          <Link href="/properties" className={buttonVariants({ variant: "outline" })}>
            <Search />
            Browse properties
          </Link>
        }
      />
      <RequestHistory requests={requests} initialFilter={initialFilter} />
    </div>
  );
}
