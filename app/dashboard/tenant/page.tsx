import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleCheck, ClipboardList, CreditCard, Hourglass, House, Search, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentStatusBadge, paymentMethodLabel } from "@/components/shared/payment-status-badge";
import { ActiveRentalCard } from "@/components/tenant/active-rental-card";
import { tenantPaymentPath } from "@/components/tenant/request-actions";
import { RequestTable } from "@/components/tenant/request-table";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getTenantPayments, getTenantRequests } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Tenant dashboard" };

export default function TenantDashboardPage() {
  const tenant = getCurrentUser("TENANT");
  // Future: GET /api/rentals and GET /api/payments
  const requests = getTenantRequests(tenant.id);
  const payments = getTenantPayments(tenant.id);

  const count = (status: string) => requests.filter((r) => r.status === status).length;
  const activeRentals = requests.filter((r) => r.status === "ACTIVE");
  const awaitingPayment = requests.filter((r) => r.status === "APPROVED");
  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Welcome back, ${tenant.name.split(" ")[0]}`}
        description="Track your rental requests, payments and current home."
        actions={
          <>
            <Link href="/dashboard/tenant/requests" className={buttonVariants({ variant: "outline" })}>
              <ClipboardList />
              View requests
            </Link>
            <Link href="/properties" className={buttonVariants()}>
              <Search />
              Browse properties
            </Link>
          </>
        }
      />

      {awaitingPayment.map((r) => (
        <div
          key={r.id}
          role="status"
          className="flex flex-col gap-4 rounded-xl border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <BadgeCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-sky-700" />
            <div>
              <p className="font-medium text-sky-950">Your request for {r.property.title} was approved</p>
              <p className="text-sm text-sky-900/80">Complete payment of {formatPrice(r.monthlyRent)} to activate your rental.</p>
            </div>
          </div>
          <Link href={tenantPaymentPath(r.id)} className={buttonVariants({ className: "w-full sm:w-auto" })}>
            <CreditCard />
            Pay now
          </Link>
        </div>
      ))}

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={requests.length} icon={ClipboardList} />
        <StatCard label="Pending" value={count("PENDING")} icon={Hourglass} tone="amber" hint="Awaiting landlord" />
        <StatCard label="Approved" value={count("APPROVED")} icon={CircleCheck} tone="blue" hint="Ready for payment" />
        <StatCard label="Active rentals" value={activeRentals.length} icon={House} tone="brand" />
      </section>

      <section aria-labelledby="current-rental">
        <h2 id="current-rental" className="text-lg font-semibold">
          Current rental
        </h2>
        <div className="mt-4 space-y-4">
          {activeRentals.length > 0 ? (
            activeRentals.map((rental) => <ActiveRentalCard key={rental.id} rental={rental} />)
          ) : (
            <EmptyState
              icon={House}
              title="No active rental"
              description="Once a landlord approves your request and you complete payment, your rental will show up here."
              action={
                <Link href="/properties" className={buttonVariants()}>
                  Browse properties
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section aria-labelledby="recent-requests">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-requests" className="text-lg font-semibold">
            Recent requests
          </h2>
          {requests.length > 0 && (
            <Link href="/dashboard/tenant/requests" className="flex items-center gap-1 rounded py-0.5 text-sm font-medium text-brand-700 hover:text-brand-800">
              View all
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
        <div className="mt-4">
          {requests.length > 0 ? (
            <RequestTable requests={requests.slice(0, 4)} />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="You haven't requested any properties yet"
              description="Find a home you like and send a rental request — you'll be able to track it here."
              action={
                <Link href="/properties" className={buttonVariants()}>
                  Browse properties
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section aria-labelledby="payments">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="payments" className="text-lg font-semibold">
            Payment history
          </h2>
          <p className="text-sm text-stone-600">
            Total paid <span className="font-semibold text-stone-900">{formatPrice(totalPaid)}</span>
          </p>
        </div>
        <div className="mt-4">
          {payments.length > 0 ? (
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
              {payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                    <Wallet aria-hidden className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-stone-900">{p.property?.title ?? "Rental payment"}</p>
                    <p className="text-sm text-stone-500">
                      {formatDate(p.createdAt)} · {paymentMethodLabel[p.method]} ·{" "}
                      <span className="font-mono text-xs">{p.transactionId}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PaymentStatusBadge status={p.status} />
                    <span className="w-24 text-right font-semibold text-stone-900">{formatPrice(p.amount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Wallet}
              title="No payments yet"
              description="Payments you make for approved rental requests will be listed here."
            />
          )}
        </div>
      </section>
    </div>
  );
}
