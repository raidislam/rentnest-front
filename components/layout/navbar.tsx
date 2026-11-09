import { Suspense } from "react";
import { Logo } from "@/components/shared/logo";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { NavbarAuth } from "./navbar-auth";

/** Same footprint as the two auth buttons, so the bar doesn't shift while the session loads. */
const AuthPlaceholder = () => <div aria-hidden className="h-10 w-44" />;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="page-container relative flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <DesktopNav />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Suspense fallback={<AuthPlaceholder />}>
            <NavbarAuth layout="desktop" />
          </Suspense>
        </div>

        <MobileNav
          auth={
            <Suspense fallback={null}>
              <NavbarAuth layout="mobile" />
            </Suspense>
          }
        />
      </div>
    </header>
  );
}
