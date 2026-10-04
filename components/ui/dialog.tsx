"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Sticky footer, e.g. action buttons. */
  footer?: ReactNode;
  /** "center" = modal dialog, "sheet" = full-height side panel (mobile filters). */
  variant?: "center" | "sheet";
  className?: string;
}

/**
 * Accessible modal built on the native <dialog> element: focus is trapped,
 * Escape closes it and the rest of the page becomes inert while open.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "center",
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-950/50 open:flex open:flex-col",
        variant === "center" &&
          "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg rounded-2xl open:animate-fade-in",
        variant === "sheet" && "my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-0.5 text-sm text-stone-600">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

      {footer && <div className="border-t border-stone-200 px-5 py-4">{footer}</div>}
    </dialog>
  );
}
