"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { Button, buttonVariants } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
  /** Overview route of the current dashboard. */
  homeHref: string;
  description: string;
}

/** Shared body for the dashboard error boundaries. Renders inside the role layout so navigation stays usable. */
export function DashboardError({ error, retry, homeHref, description }: DashboardErrorProps) {
  useEffect(() => {
    // Replace with an error reporting service later; never shown to the user.
    console.error(error);
  }, [error]);

  return (
    <ErrorState title="We couldn't load this page" description={description} className="rounded-xl border border-stone-200 bg-white">
      <Button onClick={() => retry()}>
        <RotateCcw />
        Try again
      </Button>
      <Link href={homeHref} className={buttonVariants({ variant: "outline" })}>
        Back to dashboard
      </Link>
    </ErrorState>
  );
}
