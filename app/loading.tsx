import { LogoMark } from "@/components/shared/logo";
import { PropertyGridSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1">
      <div className="border-b border-stone-200 bg-white">
        <div className="page-container flex h-16 items-center gap-3">
          <LogoMark className="animate-pulse" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="page-container py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <PropertyGridSkeleton className="mt-8" />
      </div>
      <span className="sr-only" role="status">
        Loading…
      </span>
    </div>
  );
}
