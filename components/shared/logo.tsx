import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" className="fill-brand-700" />
      <path
        d="M8 15.5 16 9l8 6.5V23a1 1 0 0 1-1 1h-4.5v-5h-5v5H9a1 1 0 0 1-1-1v-7.5Z"
        className="fill-white"
      />
      <path d="M6 16.5 16 8.5l10 8" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-brand-200" />
    </svg>
  );
}

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 rounded-md font-semibold tracking-tight", className)}
      aria-label="RentNest home"
    >
      <LogoMark />
      <span className={cn("text-lg", inverse ? "text-white" : "text-stone-900")}>
        Rent<span className={inverse ? "text-brand-300" : "text-brand-700"}>Nest</span>
      </span>
    </Link>
  );
}
