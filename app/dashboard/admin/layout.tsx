import type { Metadata } from "next";
import { Building2, ClipboardList, LayoutDashboard, Search, Users } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/mock-data";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const nav: DashboardNavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/dashboard/admin/users", label: "Users", icon: <Users /> },
  { href: "/dashboard/admin/properties", label: "Properties", icon: <Building2 /> },
  { href: "/dashboard/admin/requests", label: "Rental requests", icon: <ClipboardList /> },
  { href: "/properties", label: "Browse properties", icon: <Search /> },
];

// No route protection yet — the mock admin stands in for the signed-in user.
// Admin accounts can't be created through public registration.
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser("ADMIN");
  return (
    <DashboardShell roleLabel="Admin" nav={nav} user={user}>
      {children}
    </DashboardShell>
  );
}
