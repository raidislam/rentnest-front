import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Info, SearchX } from "lucide-react";
import { paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { PaymentResult } from "@/components/shared/payment-result";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getTenantRequestById } from "@/lib/mock-data";
import type { PaymentMethod } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const params = await searchParams;
  const ref = first(params.ref);
  const methodParam = first(params.method);
  const method: PaymentMethod = methodParam === "STRIPE" ? "STRIPE" : "SSLCOMMERZ";
  // Future: verify the payment with GET /api/payments using the gateway's reference.
  const request = getTenantRequestById(getCurrentUser("TENANT").id, first(params.request) ?? "");

  if (!request || !ref) {
    return (
      <PaymentResult
        icon={SearchX}
        tone="neutral"
        title="We couldn't find this payment"
        description="The confirmation link is incomplete. If you were charged, the payment will still appear in your payment history."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard/tenant" className={buttonVariants({ size: "lg" })}>
            Go to tenant dashboard
          </Link>
        </div>
      </PaymentResult>
    );
  }

  const nextSteps = [
    "Your rental request will be marked as Active.",
    "This payment will appear in your payment history.",
    `Move in from ${formatDate(request.moveInDate)} — and leave a review once you've settled in.`,
  ];

  return (
    <PaymentResult
      icon={CircleCheck}
      tone="success"
      title="Payment successful"
      description={
        <>
          You paid <span className="font-semibold text-stone-900">{formatPrice(request.monthlyRent)}</span> for{" "}
          {request.property.title}.
        </>
      }
      rows={[
        { term: "Reference", detail: <span className="font-mono">{ref}</span> },
        { term: "Property", detail: request.property.title },
        { term: "Amount", detail: formatPrice(request.monthlyRent) },
        { term: "Payment method", detail: paymentMethodLabel[method] },
        { term: "Date", detail: formatDate(new Date().toISOString()) },
      ]}
    >
      <section aria-labelledby="next-steps" className="mt-6 rounded-xl border border-stone-200 bg-white p-5 text-left">
        <h2 id="next-steps" className="text-sm font-semibold text-stone-900">
          What happens next
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-stone-600">
          {nextSteps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-800">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-4 flex items-start justify-center gap-1.5 text-xs text-stone-500">
        <Info aria-hidden className="mt-px size-3.5 shrink-0" />
        Demo mode: this is a simulated payment. No real transaction was processed.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard/tenant" className={buttonVariants({ size: "lg" })}>
          Go to tenant dashboard
        </Link>
        <Link href="/dashboard/tenant/requests" className={buttonVariants({ variant: "outline", size: "lg" })}>
          View my requests
        </Link>
      </div>
    </PaymentResult>
  );
}
