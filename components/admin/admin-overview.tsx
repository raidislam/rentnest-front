import Link from "next/link";
import { ArrowRight, Building2, CircleCheck, ClipboardList, Hourglass, House, Inbox, Tags, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { MappedCategory, MappedProperty, MappedRentalRequest, MappedUser } from "@/lib/api/mappers";
import { formatDate, formatPrice } from "@/lib/utils";

interface AdminOverviewProps {
  firstName: string;
  /** GET /api/admin/users */
  users: MappedUser[];
  /** GET /api/admin/properties */
  properties: MappedProperty[];
  /** GET /api/admin/rentals */
  rentals: MappedRentalRequest[];
  /** GET /api/categories */
  categories: MappedCategory[];
}

/** Admin dashboard. Every number is counted from the lists above; nothing else is assumed. */
export function AdminOverview({ firstName, users, properties, rentals, categories }: AdminOverviewProps) {
  const pendingRequests = rentals.filter((r) => r.status === "PENDING");
  const activeRentals = rentals.filter((r) => r.status === "ACTIVE").length;
  const available = properties.filter((p) => p.isAvailable).length;
  // Completed payments embedded in GET /api/admin/rentals (one payment per rental).
  const completedPayments = rentals.flatMap((r) => r.payments).filter((p) => p.status === "PAID");
  const collected = completedPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const userSummary = [
    { label: "Tenants", value: users.filter((u) => u.role === "TENANT").length },
    { label: "Landlords", value: users.filter((u) => u.role === "LANDLORD").length },
    { label: "Admins", value: users.filter((u) => u.role === "ADMIN").length },
    { label: "Banned", value: users.filter((u) => u.status === "BANNED").length },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title={`Welcome back, ${firstName}`} description="Platform overview across users, listings and rentals." />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={users.length} icon={Users} />
        <StatCard label="Total properties" value={properties.length} icon={Building2} tone="brand" />
        <StatCard label="Available properties" value={available} icon={CircleCheck} tone="amber" hint="Shown in search" />
        <StatCard label="Pending requests" value={pendingRequests.length} icon={Hourglass} tone="blue" hint="Awaiting landlords" />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="pending-requests" className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 id="pending-requests" className="text-lg font-semibold">
              Pending rental requests
            </h2>
            <Link href="/dashboard/admin/requests?status=PENDING" className="flex shrink-0 items-center gap-1 rounded py-0.5 text-sm font-medium text-brand-700 hover:text-brand-800">
              View requests
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div className="mt-4">
            {pendingRequests.length > 0 ? (
              <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
                {pendingRequests.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                    <Avatar name={r.tenant?.name ?? "Tenant"} size="sm" />
                    <div className="min-w-0 flex-1 basis-52">
                      <p className="text-sm text-stone-900">
                        <span className="font-medium">{r.tenant?.name ?? "Tenant"}</span>
                        <span className="text-stone-500"> → </span>
                        {r.propertyTitle ?? <span className="text-stone-400 italic">Property unavailable</span>}
                      </p>
                      {r.createdAt && <p className="text-sm text-stone-500">Requested {formatDate(r.createdAt)}</p>}
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Inbox} title="No pending requests" description="Landlords have responded to every request." className="py-10" />
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="user-overview" className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 id="user-overview" className="font-semibold">
              Users
            </h2>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">{users.length}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {userSummary.map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-stone-50 p-3">
                  <dt className="text-xs text-stone-500">{label}</dt>
                  <dd className="text-lg font-semibold text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/dashboard/admin/users" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}>
              Manage users
            </Link>
          </section>

          <section aria-labelledby="activity" className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 id="activity" className="font-semibold">
              Platform activity
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                { icon: ClipboardList, label: "Total requests", value: rentals.length },
                { icon: House, label: "Active rentals", value: activeRentals },
                { icon: Wallet, label: "Completed payments", value: `${completedPayments.length} · ${formatPrice(collected)}` },
                { icon: Tags, label: "Categories", value: categories.length },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-stone-600">
                    <Icon aria-hidden className="size-4 text-stone-400" />
                    {label}
                  </dt>
                  <dd className="font-semibold text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
