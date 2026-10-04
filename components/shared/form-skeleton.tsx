import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for long, sectioned forms such as the property form. */
export function FormSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div role="status" aria-label="Loading form" className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {Array.from({ length: sections }, (_, i) => (
        <div key={i} className="space-y-5 rounded-xl border border-stone-200 bg-white p-6">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-24" />
        </div>
      ))}
    </div>
  );
}
