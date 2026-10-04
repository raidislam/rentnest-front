import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { PaymentStatus } from "@/lib/types";

const config: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  PAID: { label: "Paid", tone: "brand" },
  PENDING: { label: "Pending", tone: "amber" },
  FAILED: { label: "Failed", tone: "red" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, tone } = config[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export const paymentMethodLabel = { STRIPE: "Stripe", SSLCOMMERZ: "SSLCommerz" } as const;
