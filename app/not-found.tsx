import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-container flex flex-1 flex-col items-center justify-center gap-10 py-16">
      <Logo />
      <EmptyState
        icon={SearchX}
        as="h1"
        title="We couldn't find that page"
        description="The page may have moved, or the listing is no longer available."
        className="w-full max-w-lg"
        action={
          <>
            <Link href="/properties" className={buttonVariants()}>
              Browse properties
            </Link>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Back to home
            </Link>
          </>
        }
      />
    </div>
  );
}
