import { Ban, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Role, UserStatus } from "@/lib/types";

export const roleLabel: Record<Role, string> = { TENANT: "Tenant", LANDLORD: "Landlord", ADMIN: "Admin" };

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={role === "ADMIN" ? "blue" : role === "LANDLORD" ? "brand" : "neutral"}>{roleLabel[role]}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return status === "BANNED" ? (
    <Badge tone="red">
      <Ban />
      Banned
    </Badge>
  ) : (
    <Badge tone="brand">
      <BadgeCheck />
      Active
    </Badge>
  );
}
