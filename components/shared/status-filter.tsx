"use client";

import { REQUEST_STATUSES } from "@/lib/constants";
import type { RequestStatus } from "@/lib/types";
import { FilterChips } from "./filter-chips";

export type StatusFilterValue = RequestStatus | "ALL";

export const statusFilterLabel = (f: StatusFilterValue) => (f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase());

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  /** Number of items per status, shown next to each chip. */
  counts: Record<StatusFilterValue, number>;
}

/** Request-status filter chips (All + the five request statuses). */
export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <FilterChips
      label="Filter by status"
      value={value}
      onChange={onChange}
      options={(["ALL", ...REQUEST_STATUSES] as StatusFilterValue[]).map((f) => ({
        value: f,
        label: statusFilterLabel(f),
        count: counts[f],
      }))}
    />
  );
}

export function countByStatus(items: { status: RequestStatus }[]): Record<StatusFilterValue, number> {
  const counts = { ALL: items.length } as Record<StatusFilterValue, number>;
  for (const s of REQUEST_STATUSES) counts[s] = items.filter((i) => i.status === s).length;
  return counts;
}
