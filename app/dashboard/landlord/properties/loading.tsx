import { PropertyGridSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandlordPropertiesLoading() {
  return (
    <div role="status" aria-label="Loading properties" className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="flex justify-between gap-3">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="hidden h-9 w-72 rounded-full sm:block" />
      </div>
      <PropertyGridSkeleton count={3} className="xl:grid-cols-3" />
    </div>
  );
}
