import type { Metadata } from "next";
import { Building2, ClipboardList, LayoutDashboard, Search } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const nav: DashboardNavItem[] = [
  { href: "/dashboard/landlord", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/dashboard/landlord/properties", label: "My properties", icon: <Building2 /> },
  { href: "/dashboard/landlord/requests", label: "Rental requests", icon: <ClipboardList /> },
  { href: "/properties", label: "Browse properties", icon: <Search /> },
];

export default async function LandlordDashboardLayout({ children }: { children: React.ReactNode }) {
  // Verified with GET /api/auth/me; redirects to login or the user's own dashboard.
  const user = await requireUser("LANDLORD");
  return (
    <DashboardShell roleLabel="Landlord" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
