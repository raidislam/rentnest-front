import type { Metadata } from "next";
import Link from "next/link";
import { CircleSlash } from "lucide-react";
import { PaymentResult } from "@/components/shared/payment-result";
import { tenantPaymentPath, tenantRequestPath } from "@/components/tenant/request-actions";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getTenantRequestById } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default async function PaymentCancelPage({ searchParams }: PageProps<"/payment/cancel">) {
  const { request: requestParam } = await searchParams;
  const request =
    typeof requestParam === "string" ? getTenantRequestById(getCurrentUser("TENANT").id, requestParam) : undefined;
  const canRetry = request?.status === "APPROVED";

  return (
    <PaymentResult
      icon={CircleSlash}
      tone="neutral"
      title="Payment cancelled"
      description={
        <>
          Your payment wasn&apos;t completed and you haven&apos;t been charged.
          {canRetry && " Your request is still approved, so you can try again whenever you're ready."}
        </>
      }
      rows={
        request && [
          { term: "Property", detail: request.property.title },
          { term: "Location", detail: `${request.property.location.area}, ${request.property.location.city}` },
          { term: "Amount", detail: formatPrice(request.monthlyRent) },
          { term: "Request", detail: <span className="font-mono">{request.id}</span> },
        ]
      }
    >
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        {request && canRetry && (
          <Link href={tenantPaymentPath(request.id)} className={buttonVariants({ size: "lg" })}>
            Retry payment
          </Link>
        )}
        {request && (
          <Link href={tenantRequestPath(request.id)} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Return to request
          </Link>
        )}
        <Link href="/dashboard/tenant" className={buttonVariants({ variant: request ? "ghost" : "primary", size: "lg" })}>
          Back to dashboard
        </Link>
      </div>
    </PaymentResult>
  );
}
