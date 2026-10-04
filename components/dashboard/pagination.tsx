"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Noun for the summary, e.g. "users". */
  itemLabel: string;
}

/** Lightweight client-side pagination: summary text plus Previous/Next. */
export function Pagination({ page, pageSize, total, onPageChange, itemLabel }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-stone-600" aria-live="polite">
        Showing <span className="font-medium text-stone-900">{from}</span>–<span className="font-medium text-stone-900">{to}</span> of{" "}
        <span className="font-medium text-stone-900">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft />
          Previous
        </Button>
        <span className="px-2 text-sm text-stone-600">
          Page {page} of {pageCount}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
          Next
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
