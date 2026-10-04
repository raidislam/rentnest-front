"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { House, RotateCcw } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Replace with an error reporting service later; never shown to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <ErrorState description="An unexpected problem stopped this page from loading. Please try again — if it keeps happening, come back a little later.">
        <Button onClick={() => retry()}>
          <RotateCcw />
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          <House />
          Back to home
        </Link>
      </ErrorState>
    </div>
  );
}
