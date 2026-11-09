import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { tenantPaymentPath, tenantRequestPath } from "@/components/tenant/request-actions";
import { buttonVariants } from "@/components/ui/button";
import { getMyPayment } from "@/lib/api/tenant";
import { requireUser } from "@/lib/auth/session";
import { compact, formatDate, formatLocation, formatPrice } from "@/lib/utils";

// GET /api/payments/:id — shared by generateMetadata and the page, so a missing or foreign
// payment resolves to a 404 before streaming. null = not this tenant's payment / not found / bad id.
const loadPayment = cache((id: string) => getMyPayment(id));

type Row = { term: string; detail: React.ReactNode };

export async function generateMetadata({ params }: PageProps<"/dashboard/tenant/payments/[id]">): Promise<Metadata> {
  const payment = await loadPayment((await params).id);
  return { title: payment ? "Payment details" : "Payment not found" };
}

export default async function TenantPaymentDetailsPage({ params }: PageProps<"/dashboard/tenant/payments/[id]">) {
  await requireUser("TENANT");
  const { id } = await params;
  const payment = await loadPayment(id);
  if (!payment) notFound();

  const rental = payment.rentalRequest;
  const property = rental?.property;
  const rows = compact<Row>([
    payment.amount !== undefined && { term: "Amount", detail: formatPrice(payment.amount) },
    payment.transactionId && { term: "Transaction ID", detail: <span className="font-mono text-sm">{payment.transactionId}</span> },
    payment.method && { term: "Gateway", detail: paymentMethodLabel[payment.method] },
    payment.createdAt && { term: "Started", detail: formatDate(payment.createdAt) },
    payment.paidAt && { term: "Paid on", detail: formatDate(payment.paidAt) },
  ]);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/tenant" className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-medium text-stone-600 hover:text-stone-900">
        <ArrowLeft aria-hidden className="size-4" />
        Dashboard
      </Link>
      <PageHeader title="Payment details" description={payment.propertyTitle ?? property?.title ?? "Rental payment"} actions={<PaymentStatusBadge status={payment.status} />} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Payment" className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
          {rows.length > 0 ? (
            <dl className="divide-y divide-stone-100 text-sm">
              {rows.map(({ term, detail }) => (
                <div key={term} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <dt className="text-stone-500">{term}</dt>
                  <dd className="text-right font-medium break-all text-stone-900">{detail}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-stone-600">No further details are available for this payment.</p>
          )}
          {payment.status === "FAILED" && rental?.status === "APPROVED" && (
            <div className="mt-6 flex flex-col gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <p>This payment didn&apos;t go through. Your request is still approved, so you can try again.</p>
              <Link href={tenantPaymentPath(rental.id)} className={buttonVariants({ size: "sm", className: "shrink-0" })}>
                Try again
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          {(property || payment.rentalRequestId) && (
            <section aria-label="Rental" className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="text-sm font-medium text-stone-500">Rental</h2>
              {property && (
                <>
                  <p className="mt-2 font-semibold text-stone-900">{property.title}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
                    {formatLocation(property.location)}
                  </p>
                </>
              )}
              {payment.rentalRequestId && (
                <Link href={tenantRequestPath(payment.rentalRequestId)} className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}>
                  View rental request
                </Link>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
