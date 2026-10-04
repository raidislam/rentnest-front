import type { Metadata } from "next";
import { ClipboardList, LayoutDashboard, Search } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/mock-data";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const nav: DashboardNavItem[] = [
  { href: "/dashboard/tenant", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/dashboard/tenant/requests", label: "My requests", icon: <ClipboardList /> },
  { href: "/properties", label: "Browse properties", icon: <Search /> },
];

// No route protection yet — the mock tenant stands in for the signed-in user.
export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser("TENANT");
  return (
    <DashboardShell roleLabel="Tenant" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
