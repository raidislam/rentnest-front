import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  /** Heading level for the title — use "h1" when the empty state is the whole page (e.g. not-found). */
  as?: "h1" | "h2" | "h3";
}

export function EmptyState({ icon: Icon, title, description, action, className, as: Heading = "h3" }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
        <Icon aria-hidden className="size-6" />
      </div>
      <Heading className="mt-4 text-base font-semibold text-stone-900">{title}</Heading>
      <p className="mt-1 max-w-sm text-sm text-stone-600">{description}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
