import type { Metadata } from "next";
import { UserManager } from "@/components/admin/user-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Users" description="Search accounts and ban or restore access for tenants and landlords." />
      <UserManager currentAdminId={getCurrentUser("ADMIN").id} />
    </div>
  );
}
