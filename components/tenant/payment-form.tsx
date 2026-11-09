"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ExternalLink, Info, Landmark, LoaderCircle, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { browserApi } from "@/lib/api/browser";
import { toApiError } from "@/lib/api/errors";
import { createPayment } from "@/lib/api/services/payments";
import type { PaymentStatus } from "@/lib/types";
import { isSslcommerzUrl } from "@/lib/payments";
import { formatPrice } from "@/lib/utils";
import { tenantRequestPath } from "./request-actions";

interface PaymentFormProps {
  rentalRequestId: string;
  /** Monthly rent shown on the button; the backend charges the property's price. */
  amount?: number;
  /** The previous attempt for this request, if the backend returned one. */
  previousStatus?: PaymentStatus;
}

/**
 * Starts an SSLCommerz checkout: POST /api/payments/create { rentalRequestId }, then redirects
 * to the backend-provided paymentUrl. Creating the session is NOT a payment — the backend marks the
 * payment COMPLETED only after SSLCommerz confirms it (validated server-side with val_id).
 */
export function PaymentForm({ rentalRequestId, amount, previousStatus }: PaymentFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "creating" | "redirecting">("idle");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false); // blocks double clicks before React re-renders

  const pay = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    setStatus("creating");
    try {
      const { paymentUrl } = await createPayment(browserApi, { rentalRequestId });
      if (!isSslcommerzUrl(paymentUrl)) {
        throw new Error("The payment gateway link from the server looks invalid. Please try again or contact support.");
      }
      setStatus("redirecting");
      window.location.assign(paymentUrl); // external: SSLCommerz checkout
    } catch (err) {
      inFlight.current = false;
      setStatus("idle");
      const apiError = toApiError(err);
      // A thrown Error (invalid gateway URL) has kind "unknown"; show its own message.
      setError(apiError.kind === "unknown" && err instanceof Error ? err.message : apiError.message);
      // 409 = already paid, 400 = no longer approved: reload so the page shows the real status.
      if (apiError.status === 409 || apiError.status === 400) router.refresh();
    }
  };

  const busy = status !== "idle";

  return (
    <div className="space-y-6">
      <div className="flex gap-4 rounded-xl border border-brand-600 p-4 ring-1 ring-brand-600">
        <Landmark aria-hidden className="mt-0.5 size-5 shrink-0 text-stone-500" />
        <div>
          <p className="font-medium text-stone-900">SSLCommerz</p>
          <p className="mt-1 text-sm text-stone-600">Mobile banking, local cards and internet banking on SSLCommerz&apos;s secure page.</p>
        </div>
      </div>

      {previousStatus === "FAILED" && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          Your previous payment attempt didn&apos;t go through. You can try again.
        </p>
      )}
      {previousStatus === "PENDING" && (
        <p className="flex items-start gap-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-950">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          A payment attempt was started but not confirmed yet. If you already paid, check your request status before paying again.
        </p>
      )}

      <p className="flex items-start gap-2 text-sm text-stone-600">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
        You&apos;ll complete payment on SSLCommerz. RentNest never sees your card or mobile banking details. Your rental
        becomes active only after SSLCommerz confirms the payment to RentNest — check your request afterwards to see the
        updated status.
      </p>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
        <Button size="lg" onClick={pay} disabled={busy} className="sm:min-w-56">
          {busy ? <LoaderCircle className="animate-spin" /> : <ExternalLink />}
          {status === "creating"
            ? "Starting secure checkout…"
            : status === "redirecting"
              ? "Redirecting to SSLCommerz…"
              : `Pay${amount !== undefined ? ` ${formatPrice(amount)}` : ""} with SSLCommerz`}
        </Button>
        <Link
          href={tenantRequestPath(rentalRequestId)}
          aria-disabled={busy}
          className={buttonVariants({ variant: "ghost", size: "lg", className: busy ? "pointer-events-none text-stone-600 opacity-50" : "text-stone-600" })}
        >
          Back to request
        </Link>
      </div>
    </div>
  );
}
