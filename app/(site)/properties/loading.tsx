import { PropertyGridSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="page-container py-8 sm:py-10">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-96 max-w-full" />
      <div className="mt-8 flex gap-8">
        <div className="hidden w-72 shrink-0 space-y-6 rounded-xl border border-stone-200 bg-white p-5 lg:block">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex gap-3">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-52" />
          </div>
          <Skeleton className="mt-5 h-5 w-40" />
          <PropertyGridSkeleton className="mt-6 xl:grid-cols-3 lg:grid-cols-2" />
        </div>
      </div>
      <span role="status" className="sr-only">
        Loading properties…
      </span>
    </div>
  );
}
