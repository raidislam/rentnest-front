import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({ id, eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-brand-700">{eyebrow}</p>
        <h2 id={id} className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-stone-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
