import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { LandlordRequestDetail } from "@/components/landlord/landlord-request-detail";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getPropertiesAndRequests } from "@/lib/api/landlord";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Rental request" };

export default async function LandlordRequestPage({ params }: PageProps<"/dashboard/landlord/requests/[id]">) {
  await requireUser("LANDLORD");
  const { id } = await params;
  // No single-request endpoint is documented: find it in GET /api/landlord/requests
  // (which only contains requests for this landlord's properties).
  const { requests } = await getPropertiesAndRequests();
  const request = requests.find((r) => r.id === id);

  if (!request) {
    return (
      <EmptyState
        icon={SearchX}
        as="h1"
        title="We couldn't find that request"
        description="It may have been removed, or it belongs to another landlord's property."
        className="mx-auto mt-8 max-w-lg"
        action={
          <Link href="/dashboard/landlord/requests" className={buttonVariants()}>
            View all requests
          </Link>
        }
      />
    );
  }

  return <LandlordRequestDetail key={request.id} request={request} />;
}
