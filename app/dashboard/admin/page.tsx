import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";
import { getCurrentUser, payments } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminDashboardPage() {
  const admin = getCurrentUser("ADMIN");
  // Future: from GET /api/payments (admin scope).
  const totalRevenue = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
  return <AdminOverview firstName={admin.name.split(" ")[0]} totalRevenue={totalRevenue} />;
}
