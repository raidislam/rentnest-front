import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900",
  secondary:
    "bg-brand-50 text-brand-800 hover:bg-brand-100",
  outline:
    "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-400",
  ghost: "text-stone-700 hover:bg-stone-100 hover:text-stone-900",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  inverse: "bg-white text-brand-900 shadow-sm hover:bg-brand-50",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "size-10",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

interface VariantOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Class names for button styling — use on <Link> to render a link that looks like a button. */
export function buttonVariants({ variant = "primary", size = "md", className }: VariantOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & VariantOptions) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}
