"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_LINKS, isActivePath } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Close the menu when the route changes (adjusting state during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        {open ? <X /> : <Menu />}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full animate-fade-in border-b border-stone-200 bg-white shadow-lg"
        >
          <nav aria-label="Mobile" className="page-container py-4">
            <ul className="space-y-1">
              {PUBLIC_NAV_LINKS.map(({ href, label }) => {
                const active = isActivePath(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-lg px-3 py-2.5 text-base font-medium",
                        active ? "bg-brand-50 text-brand-800" : "text-stone-700 hover:bg-stone-100",
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-200 pt-4">
              <Link href="/auth/login" className={buttonVariants({ variant: "outline" })}>
                Log in
              </Link>
              <Link href="/auth/register" className={buttonVariants()}>
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
