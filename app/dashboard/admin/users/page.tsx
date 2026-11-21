import type { Metadata } from "next";
import { UserManager } from "@/components/admin/user-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminUsers } from "@/lib/api/admin";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await requireUser("ADMIN");
  const users = await getAdminUsers();
  return (
    <div className="space-y-8">
      <PageHeader title="Users" description="Search accounts and ban or restore access." />
      <UserManager initialUsers={users} currentAdminId={session.id} />
    </div>
  );
}
