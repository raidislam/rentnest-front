import type { Metadata } from "next";
import { UserManager } from "@/components/admin/user-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/mock-data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  await requireUser("ADMIN");
  return (
    <div className="space-y-8">
      <PageHeader title="Users" description="Search accounts and ban or restore access for tenants and landlords." />
      <UserManager currentAdminId={getCurrentUser("ADMIN").id} />
    </div>
  );
}
