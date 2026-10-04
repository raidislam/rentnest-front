import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="page-container py-16">
      <EmptyState
        icon={SearchX}
        as="h1"
        title="This property isn't available"
        description="The listing may have been removed by the landlord, or the link is incorrect."
        className="mx-auto max-w-lg"
        action={
          <Link href="/properties" className={buttonVariants()}>
            Browse other properties
          </Link>
        }
      />
    </div>
  );
}
