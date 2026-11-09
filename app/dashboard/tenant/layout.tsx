import type { Metadata } from "next";
import { ClipboardList, LayoutDashboard, Search } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const nav: DashboardNavItem[] = [
  { href: "/dashboard/tenant", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/dashboard/tenant/requests", label: "My requests", icon: <ClipboardList /> },
  { href: "/properties", label: "Browse properties", icon: <Search /> },
];

export default async function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  // Verified with GET /api/auth/me; redirects to login or the user's own dashboard.
  const user = await requireUser("TENANT");
  return (
    <DashboardShell roleLabel="Tenant" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
