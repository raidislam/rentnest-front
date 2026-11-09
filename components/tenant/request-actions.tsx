import Link from "next/link";
import { CreditCard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { MappedRentalRequest } from "@/lib/api/mappers";
import { cn } from "@/lib/utils";

export const tenantRequestPath = (id: string) => `/dashboard/tenant/requests/${id}`;
export const tenantPaymentPath = (id: string) => `/dashboard/tenant/requests/${id}/pay`;

/**
 * The single most relevant action for a request, based on its status.
 * (Reviews are added with the Reviews integration; the backend only accepts them for COMPLETED rentals.)
 */
export function RequestActions({ request, className }: { request: MappedRentalRequest; className?: string }) {
  const title = request.property?.title ?? "this request";

  if (request.status === "APPROVED") {
    return (
      <Link href={tenantPaymentPath(request.id)} className={buttonVariants({ size: "sm", className })}>
        <CreditCard />
        Pay now
        <span className="sr-only">for {title}</span>
      </Link>
    );
  }

  return (
    <Link
      href={tenantRequestPath(request.id)}
      className={buttonVariants({ variant: "outline", size: "sm", className: cn(className) })}
    >
      View details
      <span className="sr-only">for {title}</span>
    </Link>
  );
}
