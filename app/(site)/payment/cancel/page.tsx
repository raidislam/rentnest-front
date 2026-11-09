import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleSlash, LogIn } from "lucide-react";
import { PaymentResult } from "@/components/shared/payment-result";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { tenantPaymentPath, tenantRequestPath } from "@/components/tenant/request-actions";
import { buttonVariants } from "@/components/ui/button";
import type { MappedPayment, MappedRentalRequest } from "@/lib/api/mappers";
import { findMyPaymentByTransaction, getMyRental } from "@/lib/api/tenant";
import { getOptionalUser } from "@/lib/auth/session";
import { readGatewayId } from "@/lib/payments";
import { compact, formatPrice } from "@/lib/utils";

type Row = { term: string; detail: React.ReactNode };

export const metadata: Metadata = { title: "Payment not completed", robots: { index: false } };

/**
 * Shown when a payment was cancelled or didn't finish. It never changes anything: the backend
 * records gateway cancellations itself (POST /api/payments/cancel is called by SSLCommerz, not us).
 * The status shown comes from GET /api/payments (by tran_id) or GET /api/rentals/:id (by request).
 */
export default async function PaymentCancelPage({ searchParams }: PageProps<"/payment/cancel">) {
  const params = await searchParams;
  const tranId = readGatewayId(params.tran_id);
  const requestId = readGatewayId(params.request);

  const user = await getOptionalUser();
  if (!user || user.role !== "TENANT") {
    return (
      <PaymentResult
        icon={LogIn}
        tone="neutral"
        title="Log in to check your payment"
        description="Payment status is private. Log in with your tenant account to see it."
      >
        <div className="mt-8 flex justify-center">
          <Link href="/auth/login" className={buttonVariants({ size: "lg" })}>
            Log in
          </Link>
        </div>
      </PaymentResult>
    );
  }

  const payment: MappedPayment | null = tranId ? await findMyPaymentByTransaction(tranId) : null;
  const rentalId = payment?.rentalRequestId ?? requestId;
  const request: MappedRentalRequest | null = rentalId ? await getMyRental(rentalId) : null;

  // The backend is the source of truth: if it says this payment completed, say so.
  if (payment?.status === "PAID") {
    return (
      <PaymentResult icon={CircleCheck} tone="success" title="This payment is already completed" description="SSLCommerz confirmed this payment, so there's nothing to retry.">
        <div className="mt-8 flex justify-center">
          <Link href={rentalId ? tenantRequestPath(rentalId) : "/dashboard/tenant/requests"} className={buttonVariants({ size: "lg" })}>
            {rentalId ? "View rental request" : "View my requests"}
          </Link>
        </div>
      </PaymentResult>
    );
  }

  const canRetry = request?.status === "APPROVED";
  const rows = compact<Row>([
    request?.property && { term: "Property", detail: request.property.title },
    payment && { term: "Payment status", detail: <PaymentStatusBadge status={payment.status} /> },
    payment?.amount !== undefined && { term: "Amount", detail: formatPrice(payment.amount) },
    payment?.transactionId && { term: "Transaction", detail: <span className="font-mono">{payment.transactionId}</span> },
  ]);

  return (
    <PaymentResult
      icon={CircleSlash}
      tone="neutral"
      title="Payment not completed"
      description={
        <>
          This payment wasn&apos;t completed, so your rental isn&apos;t active yet.
          {canRetry && " Your request is still approved, so you can try again whenever you're ready."}
        </>
      }
      rows={rows.length > 0 ? rows : undefined}
    >
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        {request && canRetry && (
          <Link href={tenantPaymentPath(request.id)} className={buttonVariants({ size: "lg" })}>
            Try payment again
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
