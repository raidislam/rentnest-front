"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ban, LoaderCircle, RotateCcw, SearchX, Users } from "lucide-react";
import { Pagination } from "@/components/dashboard/pagination";
import { Avatar } from "@/components/shared/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { RoleBadge, UserStatusBadge, roleLabel } from "@/components/shared/moderation-badges";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { browserApi } from "@/lib/api/browser";
import { toApiError } from "@/lib/api/errors";
import type { MappedUser } from "@/lib/api/mappers";
import { setUserStatus } from "@/lib/api/services/admin";
import type { Role, UserStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 8;
type RoleFilter = Role | "ALL";
type Row = MappedUser & { saving?: boolean };

interface UserManagerProps {
  /** From GET /api/admin/users (server-rendered). */
  initialUsers: MappedUser[];
  /** The signed-in admin; the backend rejects banning yourself (400). */
  currentAdminId: string;
}

export function UserManager({ initialUsers, currentAdminId }: UserManagerProps) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<Record<string, UserStatus>>({});
  const users: Row[] = initialUsers.map((u) => ({ ...u, status: confirmed[u.id] ?? u.status, saving: saving.has(u.id) }));
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<{ user: Row; action: "ban" | "unban" } | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = users.filter(
    (u) => (role === "ALL" || u.role === role) && (!q || u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /** PATCH /api/admin/users/:id { status: boolean }. The badge changes only after the backend confirms. */
  const changeStatus = async (user: Row, action: "ban" | "unban") => {
    const status: UserStatus = action === "ban" ? "BANNED" : "ACTIVE";
    setSaving((set) => new Set(set).add(user.id));
    try {
      await setUserStatus(browserApi, user.id, status);
      setConfirmed((c) => ({ ...c, [user.id]: status }));
      toast(
        action === "ban"
          ? { title: "User banned", description: `${user.name} can no longer log in to RentNest.` }
          : { title: "User unbanned", description: `${user.name}'s access has been restored.` },
      );
      router.refresh();
    } catch (err) {
      // e.g. 400 "You cannot ban your own account", 404, 403, network. Nothing changes.
      toast({
        title: action === "ban" ? "Couldn't ban user" : "Couldn't unban user",
        description: `${toApiError(err).message} No changes were made.`,
        variant: "error",
      });
    } finally {
      setSaving((set) => {
        const next = new Set(set);
        next.delete(user.id);
        return next;
      });
    }
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
                    <td className="px-4 py-3">{user.role && <RoleBadge role={user.role} />}</td>
                    <td className="px-4 py-3">
                      <StatusCell user={user} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">{user.createdAt ? formatDate(user.createdAt) : "—"}</td>
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
                  {user.role && <RoleBadge role={user.role} />}
                  <StatusCell user={user} />
                  {user.createdAt && <span className="text-stone-500">Joined {formatDate(user.createdAt)}</span>}
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
          {pending?.user.name.split(" ")[0]} won&apos;t be able to log in or use RentNest until you unban the account, and any
          existing sessions stop working. Their listings and rental requests stay on record.
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

function UserCell({ user, isSelf }: { user: Row; isSelf: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={user.name} />
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-medium text-stone-900">
          <span className="truncate">{user.name}</span>
          {isSelf && <Badge tone="blue">You</Badge>}
        </p>
        {user.email && <p className="truncate text-sm text-stone-500">{user.email}</p>}
      </div>
    </div>
  );
}

function StatusCell({ user }: { user: Row }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {user.status && <UserStatusBadge status={user.status} />}
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
  user: Row;
  isSelf: boolean;
  onAction: (action: "ban" | "unban") => void;
  fullWidth?: boolean;
}) {
  // The backend rejects banning your own account; it doesn't restrict other admins.
  if (isSelf) return <span className="text-sm text-stone-500">This is you</span>;
  if (!user.status) return null;
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
