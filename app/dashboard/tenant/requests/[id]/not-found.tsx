import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function TenantRequestNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      as="h1"
      title="We couldn't find that request"
      description="It may have been removed, or the link is incorrect. Your other requests are still in your history."
      className="mx-auto mt-8 max-w-lg"
      action={
        <>
          <Link href="/dashboard/tenant/requests" className={buttonVariants()}>
            View my requests
          </Link>
          <Link href="/dashboard/tenant" className={buttonVariants({ variant: "outline" })}>
            Back to dashboard
          </Link>
        </>
      }
    />
  );
}
