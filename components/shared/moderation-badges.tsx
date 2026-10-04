import { Ban, BadgeCheck, CircleCheck, CircleX, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PropertyStatus, Role, UserStatus } from "@/lib/types";

const propertyStatus: Record<PropertyStatus, { label: string; tone: "amber" | "brand" | "red"; icon: typeof Hourglass }> = {
  PENDING: { label: "Pending review", tone: "amber", icon: Hourglass },
  APPROVED: { label: "Approved", tone: "brand", icon: CircleCheck },
  REJECTED: { label: "Rejected", tone: "red", icon: CircleX },
};

/** Listing moderation status (icon + text, so it doesn't rely on colour). */
export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { label, tone, icon: Icon } = propertyStatus[status];
  return (
    <Badge tone={tone}>
      <Icon />
      {label}
    </Badge>
  );
}

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
