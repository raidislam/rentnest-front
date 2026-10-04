import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Recovery actions, e.g. a retry button and a link home. */
  children?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this page. Please try again in a moment.",
  children,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <TriangleAlert aria-hidden className="size-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-stone-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-stone-600">{description}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
