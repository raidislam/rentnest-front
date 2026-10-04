import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-xs transition-colors " +
  "placeholder:text-stone-400 hover:border-stone-400 focus-visible:border-brand-600 focus-visible:outline-none " +
  "focus-visible:ring-3 focus-visible:ring-brand-600/15 disabled:cursor-not-allowed disabled:bg-stone-100 " +
  "aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500/15";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-stone-800", className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "h-10 appearance-none pr-9", className)} {...props} />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-500"
      />
    </div>
  );
}

/** Accessible error text — link it to the control with aria-describedby. */
export function FieldError({ className, children, ...props }: ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p role="alert" className={cn("text-sm text-red-600", className)} {...props}>
      {children}
    </p>
  );
}

export function FieldHint({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm text-stone-500", className)} {...props} />;
}

/** ARIA props linking a control to its <FormField> error message. */
export function fieldAria(id: string, error: unknown) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
}

/** Label + control + error message. Pair the control with {...fieldAria(id, error)}. */
export function FormField({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
