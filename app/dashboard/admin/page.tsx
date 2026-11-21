import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";
import { getAdminProperties, getAdminRentals, getAdminUsers, getAllCategories } from "@/lib/api/admin";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const session = await requireUser("ADMIN");
  const [users, properties, rentals, categories] = await Promise.all([
    getAdminUsers(),
    getAdminProperties(),
    getAdminRentals(),
    getAllCategories(),
  ]);
  return (
    <AdminOverview firstName={session.name.split(" ")[0]} users={users} properties={properties} rentals={rentals} categories={categories} />
  );
}
