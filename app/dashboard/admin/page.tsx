import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";
import { payments } from "@/lib/mock-data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const session = await requireUser("ADMIN");
  // Page data is still mock data (wired to the API in a later step); the greeting uses the signed-in user.
  // Future: from GET /api/payments (admin scope).
  const totalRevenue = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
  return <AdminOverview firstName={session.name.split(" ")[0]} totalRevenue={totalRevenue} />;
}
