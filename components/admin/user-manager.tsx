"use client";

import { useState } from "react";
import { Ban, LoaderCircle, RotateCcw, SearchX, Users } from "lucide-react";
import { Pagination } from "@/components/dashboard/pagination";
import { shouldSimulateFailure, useOptimisticPatch, type WithSaving } from "@/components/dashboard/use-optimistic-patch";
import { Avatar } from "@/components/shared/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { RoleBadge, UserStatusBadge, roleLabel } from "@/components/shared/moderation-badges";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { MockApiError, updateUserStatus } from "@/lib/mock-api";
import { useAdminUsers } from "@/lib/mock-store";
import type { Role, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 8;
type RoleFilter = Role | "ALL";

export function UserManager({ currentAdminId }: { currentAdminId: string }) {
  const toast = useToast();
  const [users, run] = useOptimisticPatch(useAdminUsers());
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<{ user: User; action: "ban" | "unban" } | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = users.filter(
    (u) => (role === "ALL" || u.role === role) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeStatus = (user: User, action: "ban" | "unban") => {
    const status = action === "ban" ? "BANNED" : "ACTIVE";
    const simulateFailure = shouldSimulateFailure();
    run(user.id, { status }, () => updateUserStatus(user.id, status, { simulateFailure }), {
      onSuccess: () =>
        toast(
          action === "ban"
            ? { title: "User banned", description: `${user.name} can no longer log in to RentNest.` }
            : { title: "User unbanned", description: `${user.name}'s access has been restored.` },
        ),
      onError: (err) =>
        toast({
          title: action === "ban" ? "Couldn't ban user" : "Couldn't unban user",
          description: `${err instanceof MockApiError ? err.message : "Something went wrong."} No changes were made.`,
          variant: "error",
        }),
    });
  };

  const roleOptions = (["ALL", "TENANT", "LANDLORD", "ADMIN"] as RoleFilter[]).map((r) => ({
    value: r,
    label: r === "ALL" ? "All" : `${roleLabel[r]}s`,
    count: r === "ALL" ? users.length : users.filter((u) => u.role === r).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchInput
          label="Search users"
          placeholder="Search by name or email"
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          className="xl:w-80"
        />
        <FilterChips
          label="Filter by role"
          options={roleOptions}
          value={role}
          onChange={(r) => {
            setRole(r);
            setPage(1);
          }}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length} users found
      </p>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users yet" description="Accounts appear here as people register on RentNest." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No users match your search"
          description="Check the spelling, or search by a different name or email address."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setRole("ALL");
              }}
            >
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-medium tracking-wide text-stone-500 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">User</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Joined</th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/60">
                    <td className="w-full max-w-0 px-4 py-3">
                      <UserCell user={user} isSelf={user.id === currentAdminId} />
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusCell user={user} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <UserAction user={user} isSelf={user.id === currentAdminId} onAction={(action) => setPending({ user, action })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
            {visible.map((user) => (
              <li key={user.id} className="rounded-xl border border-stone-200 bg-white p-4">
                <UserCell user={user} isSelf={user.id === currentAdminId} />
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <RoleBadge role={user.role} />
                  <StatusCell user={user} />
                  <span className="text-stone-500">Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="mt-4">
                  <UserAction
                    user={user}
                    isSelf={user.id === currentAdminId}
                    onAction={(action) => setPending({ user, action })}
                    fullWidth
                  />
                </div>
              </li>
            ))}
          </ul>

          <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} itemLabel="users" />
        </>
      )}

      <ConfirmDialog
        open={pending?.action === "ban"}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) changeStatus(pending.user, "ban");
          setPending(null);
        }}
        title={`Ban ${pending?.user.name ?? "user"}?`}
        subtitle={pending?.user.email}
        confirmLabel="Ban user"
        confirmIcon={<Ban />}
      >
        <p>
          {pending?.user.name.split(" ")[0]} won&apos;t be able to log in or use RentNest until you unban the account. Their
          existing listings and rental requests stay on record.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={pending?.action === "unban"}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) changeStatus(pending.user, "unban");
          setPending(null);
        }}
        title={`Unban ${pending?.user.name ?? "user"}?`}
        subtitle={pending?.user.email}
        confirmLabel="Unban user"
        confirmIcon={<RotateCcw />}
        tone="primary"
      >
        <p>{pending?.user.name.split(" ")[0]} will be able to log in and use RentNest again.</p>
      </ConfirmDialog>
    </div>
  );
}

function UserCell({ user, isSelf }: { user: User; isSelf: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={user.name} src={user.avatarUrl} />
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-medium text-stone-900">
          <span className="truncate">{user.name}</span>
          {isSelf && <Badge tone="blue">You</Badge>}
        </p>
        <p className="truncate text-sm text-stone-500">{user.email}</p>
      </div>
    </div>
  );
}

function StatusCell({ user }: { user: WithSaving<User> }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <UserStatusBadge status={user.status} />
      {user.saving && (
        <span role="status" className="flex items-center gap-1 text-xs text-stone-500">
          <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
          Saving…
        </span>
      )}
    </span>
  );
}

function UserAction({
  user,
  isSelf,
  onAction,
  fullWidth = false,
}: {
  user: WithSaving<User>;
  isSelf: boolean;
  onAction: (action: "ban" | "unban") => void;
  fullWidth?: boolean;
}) {
  if (isSelf) return <span className="text-sm text-stone-500">This is you</span>;
  if (user.role === "ADMIN") return <span className="text-sm text-stone-500">Admin account</span>;
  const className = fullWidth ? "w-full" : undefined;
  return user.status === "BANNED" ? (
    <Button variant="outline" size="sm" onClick={() => onAction("unban")} disabled={user.saving} className={className}>
      <RotateCcw />
      Unban
      <span className="sr-only">{user.name}</span>
    </Button>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onAction("ban")}
      disabled={user.saving}
      className={`text-red-700 hover:border-red-300 hover:bg-red-50 ${className ?? ""}`}
    >
      <Ban />
      Ban
      <span className="sr-only">{user.name}</span>
    </Button>
  );
}
