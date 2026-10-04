"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  href: string;
  label: string;
  /** Rendered icon element, e.g. <House /> (elements can cross the server/client boundary). */
  icon: ReactNode;
  /** Match the path exactly instead of as a prefix (for the overview route). */
  exact?: boolean;
}

interface DashboardShellProps {
  roleLabel: string;
  nav: DashboardNavItem[];
  user: { name: string; email: string; avatarUrl?: string };
  children: ReactNode;
}

export function DashboardShell({ roleLabel, nav, user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu after navigating (adjusting state during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const isActive = (item: DashboardNavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const navList = (
    <ul className="space-y-1">
      {nav.map((item) => {
        const active = isActive(item);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors [&_svg]:size-[18px] [&_svg]:shrink-0",
                active
                  ? "bg-brand-50 text-brand-800 [&_svg]:text-brand-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 [&_svg]:text-stone-400",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const userPanel = (
    <div className="border-t border-stone-200 pt-4">
      <div className="flex items-center gap-3 px-1">
        <Avatar name={user.name} src={user.avatarUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900">{user.name}</p>
          <p className="truncate text-xs text-stone-500">{user.email}</p>
        </div>
      </div>
      {/* Mock logout: there is no session yet, so this simply returns to the login page. */}
      <Link
        href="/auth/login"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "mt-3 w-full justify-start text-stone-600" })}
      >
        <LogOut />
        Log out
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-1">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-sm font-medium shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-stone-200 bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo />
          <p className="mt-1 pl-10 text-xs font-medium tracking-wide text-stone-500 uppercase">{roleLabel}</p>
        </div>
        <nav aria-label="Dashboard" className="mt-8 flex-1 overflow-y-auto">
          {navList}
        </nav>
        {userPanel}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{roleLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open dashboard menu"
            aria-expanded={menuOpen}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Menu />
          </button>
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title={`${roleLabel} menu`} variant="sheet">
        <div className="flex h-full flex-col justify-between gap-8">
          <nav aria-label="Dashboard">{navList}</nav>
          {userPanel}
        </div>
      </Dialog>
    </div>
  );
}
