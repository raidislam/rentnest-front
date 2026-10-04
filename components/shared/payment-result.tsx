import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PaymentResultProps {
  icon: LucideIcon;
  tone: "success" | "neutral";
  title: string;
  description: ReactNode;
  /** Rows for the receipt/summary card. */
  rows?: { term: string; detail: ReactNode }[];
  children?: ReactNode;
}

/** Shared frame for the payment success and cancel pages. */
export function PaymentResult({ icon: Icon, tone, title, description, rows, children }: PaymentResultProps) {
  return (
    <div className="page-container py-12 sm:py-16">
      <div className="mx-auto max-w-lg text-center">
        <div
          className={cn(
            "mx-auto flex size-16 items-center justify-center rounded-full",
            tone === "success" ? "bg-brand-100 text-brand-700" : "bg-stone-200/70 text-stone-600",
          )}
        >
          <Icon aria-hidden className="size-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
        <div className="mt-2 text-stone-600">{description}</div>

        {rows && rows.length > 0 && (
          <dl className="mt-8 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white text-left text-sm">
            {rows.map(({ term, detail }) => (
              <div key={term} className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-stone-500">{term}</dt>
                <dd className="min-w-0 text-right font-medium break-words text-stone-900">{detail}</dd>
              </div>
            ))}
          </dl>
        )}

        {children}
      </div>
    </div>
  );
}
