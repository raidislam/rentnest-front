import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="page-container relative flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <DesktopNav />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/auth/login" className={buttonVariants({ variant: "ghost" })}>
            Log in
          </Link>
          <Link href="/auth/register" className={buttonVariants()}>
            Register
          </Link>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
