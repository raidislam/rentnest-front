import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/types";

const config: Record<RequestStatus, { label: string; tone: BadgeTone; dot: string }> = {
  PENDING: { label: "Pending", tone: "amber", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", tone: "blue", dot: "bg-sky-500" },
  REJECTED: { label: "Rejected", tone: "red", dot: "bg-red-500" },
  ACTIVE: { label: "Active", tone: "brand", dot: "bg-brand-500" },
  COMPLETED: { label: "Completed", tone: "neutral", dot: "bg-stone-400" },
};

/** Rental request status badge — the single source of status colours across all dashboards. */
export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const { label, tone, dot } = config[status];
  return (
    <Badge tone={tone} className={className}>
      <span aria-hidden className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </Badge>
  );
}
