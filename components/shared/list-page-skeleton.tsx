import { TableSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Header + search + filter chips + table placeholder for dashboard list pages. */
export function ListPageSkeleton({ label, chips = 4, columns = 5 }: { label: string; chips?: number; columns?: number }) {
  return (
    <div role="status" aria-label={label} className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
        <Skeleton className="h-10 w-full lg:w-80" />
        <div className="flex gap-2">
          {Array.from({ length: chips }, (_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
      </div>
      <TableSkeleton rows={6} columns={columns} />
    </div>
  );
}
