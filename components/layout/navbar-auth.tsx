import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth/session";
import { dashboardPath } from "@/lib/utils";

/**
 * Session-aware navbar buttons (Server Component). Rendered inside <Suspense>
 * so the rest of the page streams without waiting for GET /api/auth/me.
 * Signed out (or backend unreachable): Log in / Register. Signed in: Log out / Dashboard.
 */
export async function NavbarAuth({ layout }: { layout: "desktop" | "mobile" }) {
  const user = await getOptionalUser();
  const secondary = layout === "desktop" ? "ghost" : "outline";

  if (!user) {
    return (
      <>
        <Link href="/auth/login" className={buttonVariants({ variant: secondary })}>
          Log in
        </Link>
        <Link href="/auth/register" className={buttonVariants()}>
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <LogoutButton variant={secondary} />
      <Link href={dashboardPath(user.role)} className={buttonVariants()}>
        Dashboard
      </Link>
    </>
  );
}
