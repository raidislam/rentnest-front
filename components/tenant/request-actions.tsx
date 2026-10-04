import Link from "next/link";
import { CreditCard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { RentalRequestDetails } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LeaveReviewButton } from "./leave-review-button";

export const tenantRequestPath = (id: string) => `/dashboard/tenant/requests/${id}`;
export const tenantPaymentPath = (id: string) => `/dashboard/tenant/requests/${id}/pay`;

/** The single most relevant action for a request, based on its status. */
export function RequestActions({ request, className }: { request: RentalRequestDetails; className?: string }) {
  if (request.status === "APPROVED") {
    return (
      <Link href={tenantPaymentPath(request.id)} className={buttonVariants({ size: "sm", className })}>
        <CreditCard />
        Pay now
      </Link>
    );
  }

  if (request.status === "ACTIVE" && !request.review) {
    return (
      <LeaveReviewButton
        rentalRequestId={request.id}
        propertyId={request.property.id}
        propertyTitle={request.property.title}
        className={className}
      />
    );
  }

  return (
    <Link
      href={tenantRequestPath(request.id)}
      className={buttonVariants({ variant: "outline", size: "sm", className: cn(className) })}
    >
      View details
      <span className="sr-only">for {request.property.title}</span>
    </Link>
  );
}
