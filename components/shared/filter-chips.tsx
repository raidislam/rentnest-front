"use client";

import { cn } from "@/lib/utils";

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  label: string;
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Single-select filter chips with optional counts. Scrolls horizontally on narrow screens. */
export function FilterChips<T extends string>({ label, options, value, onChange }: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
              active
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-400",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn("text-xs", active ? "text-brand-100" : "text-stone-500")}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
