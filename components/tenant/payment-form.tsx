"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Landmark, LoaderCircle, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { submitMockPayment } from "@/lib/mock-api";
import type { PaymentMethod } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

const METHODS: {
  value: PaymentMethod;
  name: string;
  description: string;
  options: string[];
  icon: typeof Landmark;
  recommended?: boolean;
}[] = [
  {
    value: "SSLCOMMERZ",
    name: "SSLCommerz",
    description: "Mobile banking, local cards and internet banking.",
    options: ["bKash", "Nagad", "Rocket", "Visa", "Mastercard", "Internet banking"],
    icon: Landmark,
    recommended: true,
  },
  {
    value: "STRIPE",
    name: "Stripe",
    description: "International credit and debit cards.",
    options: ["Visa", "Mastercard", "Amex"],
    icon: CreditCard,
  },
];

interface PaymentFormProps {
  rentalRequestId: string;
  amount: number;
}

export function PaymentForm({ rentalRequestId, amount }: PaymentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [method, setMethod] = useState<PaymentMethod>("SSLCOMMERZ");
  const [status, setStatus] = useState<"idle" | "processing" | "redirecting">("idle");
  const [error, setError] = useState<string | null>(null);
  const gateway = METHODS.find((m) => m.value === method)!.name;

  const pay = async () => {
    setError(null);
    setStatus("processing");
    try {
      const result = await submitMockPayment({ rentalRequestId, method });
      setStatus("redirecting");
      toast({ title: "Payment successful", description: `${formatPrice(amount)} paid via ${gateway}.` });
      const params = new URLSearchParams({ request: rentalRequestId, ref: result.transactionId, method });
      router.push(`/payment/success?${params}`);
    } catch {
      setStatus("idle");
      setError("We couldn't start the payment. Please try again.");
    }
  };

  const busy = status !== "idle";

  return (
    <div className="space-y-6">
      <fieldset disabled={busy}>
        <legend className="font-semibold text-stone-900">Payment method</legend>
        <div className="mt-3 space-y-3">
          {METHODS.map(({ value, name, description, options, icon: Icon, recommended }) => (
            <div key={value}>
              <input
                id={`method-${value}`}
                type="radio"
                name="method"
                value={value}
                checked={method === value}
                onChange={() => setMethod(value)}
                className="peer sr-only"
              />
              <label
                htmlFor={`method-${value}`}
                className={cn(
                  "flex cursor-pointer gap-4 rounded-xl border border-stone-300 bg-white p-4 transition-colors hover:border-stone-400",
                  "peer-checked:border-brand-600 peer-checked:ring-1 peer-checked:ring-brand-600",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    method === value ? "border-brand-700" : "border-stone-300",
                  )}
                >
                  {method === value && <span className="size-2.5 rounded-full bg-brand-700" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <Icon aria-hidden className="size-4 text-stone-500" />
                    <span className="font-medium text-stone-900">{name}</span>
                    {recommended && (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-800">
                        Recommended in Bangladesh
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-stone-600">{description}</span>
                  <span className="mt-2.5 flex flex-wrap gap-1.5">
                    {options.map((o) => (
                      <span key={o} className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs text-stone-700">
                        {o}
                      </span>
                    ))}
                  </span>
                </span>
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <p className="flex items-start gap-2 text-sm text-stone-600">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
        You&apos;ll complete payment on {gateway}&apos;s secure page. RentNest never sees or stores your card or mobile
        banking details.
      </p>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
        <Button size="lg" onClick={pay} disabled={busy} className="sm:min-w-56">
          {busy ? <LoaderCircle className="animate-spin" /> : <Lock />}
          {status === "processing"
            ? "Processing payment…"
            : status === "redirecting"
              ? "Redirecting…"
              : `Pay ${formatPrice(amount)}`}
        </Button>
        <Link
          href={`/payment/cancel?request=${rentalRequestId}`}
          aria-disabled={busy}
          className={buttonVariants({
            variant: "ghost",
            size: "lg",
            className: cn("text-stone-600", busy && "pointer-events-none opacity-50"),
          })}
        >
          Cancel payment
        </Link>
      </div>
    </div>
  );
}
