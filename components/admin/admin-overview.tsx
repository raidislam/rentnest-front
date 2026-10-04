"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, ClipboardList, Hourglass, Inbox, ShieldCheck, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyStatusBadge } from "@/components/shared/moderation-badges";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { useAdminProperties, useAdminRequests, useAdminStats, useAdminUsers } from "@/lib/mock-store";
import { formatDate, formatPrice, isOptimizableImage } from "@/lib/utils";

interface AdminOverviewProps {
  firstName: string;
  /** Total of paid rent across the platform (from payments, static in the mock phase). */
  totalRevenue: number;
}

export function AdminOverview({ firstName, totalRevenue }: AdminOverviewProps) {
  const stats = useAdminStats();
  const users = useAdminUsers();
  const pendingProperties = useAdminProperties().filter((p) => p.status === "PENDING");
  const requests = useAdminRequests();
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const activeRentals = requests.filter((r) => r.status === "ACTIVE").length;

  const userSummary = [
    { label: "Tenants", value: users.filter((u) => u.role === "TENANT").length },
    { label: "Landlords", value: users.filter((u) => u.role === "LANDLORD").length },
    { label: "Admins", value: users.filter((u) => u.role === "ADMIN").length },
    { label: "Banned", value: users.filter((u) => u.status === "BANNED").length },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title={`Welcome back, ${firstName}`} description="Platform overview and items waiting for moderation." />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Total properties" value={stats.totalProperties} icon={Building2} tone="brand" />
        <StatCard label="Pending approvals" value={stats.pendingProperties} icon={ShieldCheck} tone="amber" hint="Listings to review" />
        <StatCard label="Pending requests" value={stats.pendingRequests} icon={Hourglass} tone="blue" hint="Awaiting landlords" />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="pending-properties">
            <SectionHeader id="pending-properties" title="Listings awaiting approval" href="/dashboard/admin/properties?status=PENDING" cta="Review properties" />
            <div className="mt-4">
              {pendingProperties.length > 0 ? (
                <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
                  {pendingProperties.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        <Image src={p.images[0]} alt="" fill sizes="56px" unoptimized={!isOptimizableImage(p.images[0])} className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 basis-52">
                        <p className="line-clamp-1 font-medium text-stone-900">{p.title}</p>
                        <p className="text-sm text-stone-500">
                          {p.landlord?.name ?? "Unknown landlord"} · {p.location.area}, {p.location.city} · {formatPrice(p.price)}/mo
                        </p>
                        <p className="text-xs text-stone-500">Submitted {formatDate(p.createdAt)}</p>
                      </div>
                      <PropertyStatusBadge status={p.status} />
                      <Link
                        href="/dashboard/admin/properties?status=PENDING"
                        className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full sm:w-auto" })}
                      >
                        Review
                        <span className="sr-only">{p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={ShieldCheck} title="No listings to review" description="You're all caught up — new listings will appear here." className="py-10" />
              )}
            </div>
          </section>

          <section aria-labelledby="pending-requests">
            <SectionHeader id="pending-requests" title="Pending rental requests" href="/dashboard/admin/requests?status=PENDING" cta="Review requests" />
            <div className="mt-4">
              {pendingRequests.length > 0 ? (
                <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
                  {pendingRequests.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                      <Avatar name={r.tenant.name} src={r.tenant.avatarUrl} size="sm" />
                      <div className="min-w-0 flex-1 basis-52">
                        <p className="text-sm text-stone-900">
                          <span className="font-medium">{r.tenant.name}</span>
                          <span className="text-stone-500"> → </span>
                          {r.property?.title ?? <span className="text-stone-400 italic">Removed property</span>}
                        </p>
                        <p className="text-sm text-stone-500">
                          Landlord: {r.landlord.name} · requested {formatDate(r.createdAt)}
                        </p>
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
        </div>

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
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-stone-600">
                  <ClipboardList aria-hidden className="size-4 text-stone-400" />
                  Total requests
                </dt>
                <dd className="font-semibold text-stone-900">{requests.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-stone-600">
                  <Building2 aria-hidden className="size-4 text-stone-400" />
                  Active rentals
                </dt>
                <dd className="font-semibold text-stone-900">{activeRentals}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-stone-600">
                  <ShieldCheck aria-hidden className="size-4 text-stone-400" />
                  Rent collected
                </dt>
                <dd className="font-semibold text-stone-900">{formatPrice(totalRevenue)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ id, title, href, cta }: { id: string; title: string; href: string; cta: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      <Link href={href} className="flex shrink-0 items-center gap-1 rounded py-0.5 text-sm font-medium text-brand-700 hover:text-brand-800">
        {cta}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
