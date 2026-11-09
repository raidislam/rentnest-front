import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, CircleCheck, Clock, LogIn, SearchX, type LucideIcon } from "lucide-react";
import { PaymentResult } from "@/components/shared/payment-result";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { tenantRequestPath } from "@/components/tenant/request-actions";
import { buttonVariants } from "@/components/ui/button";
import type { MappedPayment } from "@/lib/api/mappers";
import { confirmMyPayment, findMyPaymentByTransaction } from "@/lib/api/tenant";
import { getOptionalUser } from "@/lib/auth/session";
import { readGatewayId } from "@/lib/payments";
import { compact, formatDate, formatPrice } from "@/lib/utils";

type Row = { term: string; detail: React.ReactNode };

export const metadata: Metadata = { title: "Payment status", robots: { index: false } };

/**
 * Payment return page. Nothing here is trusted from the URL alone:
 * - tran_id + val_id -> POST /api/payments/confirm; the backend validates val_id with SSLCommerz.
 * - tran_id only      -> the payment's real status from GET /api/payments.
 * Success is shown only when the backend reports the payment as COMPLETED.
 *
 * Note: with the backend's current SSLCommerz settings (per its .env.example), the gateway returns
 * users to the backend's own /api/payments/success, which confirms the payment server-side.
 */
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const params = await searchParams;
  const tranId = readGatewayId(params.tran_id);
  const valId = readGatewayId(params.val_id);

  if (!tranId) {
    return (
      <Outcome icon={SearchX} title="We couldn't confirm this payment" description="This link doesn't include a valid transaction reference, so we can't check the payment. Your request page always shows the latest status." />
    );
  }

  const user = await getOptionalUser();
  if (!user || user.role !== "TENANT") {
    const next = `/payment/success?${new URLSearchParams({ tran_id: tranId, ...(valId ? { val_id: valId } : {}) })}`;
    return (
      <Outcome
        icon={LogIn}
        title="Log in to check your payment"
        description="Payment status is private. Log in with the tenant account that made the payment to see it."
        action={
          <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className={buttonVariants({ size: "lg" })}>
            Log in
          </Link>
        }
      />
    );
  }

  let payment: MappedPayment | null = null;
  let backendMessage: string | null = null;
  if (valId) {
    const outcome = await confirmMyPayment(tranId, valId);
    if (outcome.ok) payment = outcome.payment;
    else backendMessage = outcome.message;
  }
  // Always read the stored status too (also covers confirm responses without a body).
  payment = (await findMyPaymentByTransaction(tranId)) ?? payment;

  if (payment?.status === "PAID") {
    return (
      <PaymentResult
        icon={CircleCheck}
        tone="success"
        title="Payment confirmed"
        description="RentNest has confirmed your payment with SSLCommerz. Your rental is now active."
        rows={receiptRows(payment)}
      >
        <Actions payment={payment} />
      </PaymentResult>
    );
  }

  if (payment?.status === "PENDING" && !backendMessage) {
    return (
      <Outcome
        icon={Clock}
        title="Payment not confirmed yet"
        description="We haven't received a confirmation from SSLCommerz for this payment. If you completed it, check again in a moment — your request page shows the latest status."
        rows={receiptRows(payment)}
        action={<Actions payment={payment} />}
      />
    );
  }

  return (
    <Outcome
      icon={CircleAlert}
      title="Payment not confirmed"
      description={
        <>
          {backendMessage ?? (payment?.status === "FAILED" ? "This payment didn't go through." : "We couldn't find this payment in your account.")}{" "}
          You haven&apos;t been marked as paid. If your request is still approved, you can try again.
        </>
      }
      rows={payment ? receiptRows(payment) : undefined}
      action={<Actions payment={payment} />}
    />
  );
}

function receiptRows(p: MappedPayment) {
  return compact<Row>([
    { term: "Status", detail: <PaymentStatusBadge status={p.status} /> },
    p.propertyTitle && { term: "Property", detail: p.propertyTitle },
    p.amount !== undefined && { term: "Amount", detail: formatPrice(p.amount) },
    p.transactionId && { term: "Transaction", detail: <span className="font-mono">{p.transactionId}</span> },
    p.method && { term: "Gateway", detail: paymentMethodLabel[p.method] },
    p.paidAt && { term: "Paid on", detail: formatDate(p.paidAt) },
  ]);
}

function Actions({ payment }: { payment: MappedPayment | null }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      {payment?.rentalRequestId ? (
        <Link href={tenantRequestPath(payment.rentalRequestId)} className={buttonVariants({ size: "lg" })}>
          View rental request
        </Link>
      ) : (
        <Link href="/dashboard/tenant/requests" className={buttonVariants({ size: "lg" })}>
          View my requests
        </Link>
      )}
      <Link href="/dashboard/tenant" className={buttonVariants({ variant: "outline", size: "lg" })}>
        Go to dashboard
      </Link>
    </div>
  );
}

function Outcome(props: {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  rows?: { term: string; detail: React.ReactNode }[];
  action?: React.ReactNode;
}) {
  return (
    <PaymentResult icon={props.icon} tone="neutral" title={props.title} description={props.description} rows={props.rows}>
      {props.action ?? <Actions payment={null} />}
    </PaymentResult>
  );
}
