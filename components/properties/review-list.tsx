import { MessageSquare, Star } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import type { Review, User } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("size-4", i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200")}
        />
      ))}
    </span>
  );
}

interface ReviewListProps {
  reviews: (Review & { tenant?: User })[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Tenants can leave a review once their rental is active. Be the first to share your experience."
        className="py-10"
      />
    );
  }

  return (
    <ul className="space-y-6">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-4">
          <Avatar name={r.tenant?.name ?? "Tenant"} src={r.tenant?.avatarUrl} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-medium text-stone-900">{r.tenant?.name ?? "Former tenant"}</p>
              <StarRating rating={r.rating} />
              <time dateTime={r.createdAt} className="text-sm text-stone-500">
                {formatDate(r.createdAt)}
              </time>
            </div>
            <p className="mt-1.5 text-stone-700">{r.comment}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
