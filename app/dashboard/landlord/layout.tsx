import type { Metadata } from "next";
import { Building2, ClipboardList, LayoutDashboard, Search } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/mock-data";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const nav: DashboardNavItem[] = [
  { href: "/dashboard/landlord", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/dashboard/landlord/properties", label: "My properties", icon: <Building2 /> },
  { href: "/dashboard/landlord/requests", label: "Rental requests", icon: <ClipboardList /> },
  { href: "/properties", label: "Browse properties", icon: <Search /> },
];

// No route protection yet — the mock landlord stands in for the signed-in user.
export default function LandlordDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser("LANDLORD");
  return (
    <DashboardShell roleLabel="Landlord" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
