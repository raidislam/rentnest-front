import Link from "next/link";
import { BadgeCheck, CircleCheckBig, CircleX, CreditCard, Hourglass, House, Search, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { MappedRentalRequest } from "@/lib/api/mappers";
import type { RequestStatus } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { tenantPaymentPath } from "./request-actions";

const styles: Record<RequestStatus, { icon: LucideIcon; box: string; iconColor: string }> = {
  PENDING: { icon: Hourglass, box: "border-amber-200 bg-amber-50", iconColor: "text-amber-700" },
  APPROVED: { icon: BadgeCheck, box: "border-sky-200 bg-sky-50", iconColor: "text-sky-700" },
  REJECTED: { icon: CircleX, box: "border-red-200 bg-red-50", iconColor: "text-red-600" },
  ACTIVE: { icon: House, box: "border-brand-200 bg-brand-50", iconColor: "text-brand-700" },
  COMPLETED: { icon: CircleCheckBig, box: "border-stone-200 bg-stone-100/70", iconColor: "text-stone-600" },
};

/** Status-specific explanation and next step for a tenant's request. */
export function RequestStatusPanel({ request }: { request: MappedRentalRequest }) {
  const { icon: Icon, box, iconColor } = styles[request.status];
  const landlord = request.property?.landlord?.name.split(" ")[0] ?? "The landlord";
  const amount = request.monthlyRent !== undefined ? ` ${formatPrice(request.monthlyRent)}` : "";

  const content: Record<RequestStatus, { title: string; body: React.ReactNode; action?: React.ReactNode }> = {
    PENDING: {
      title: "Pending review",
      body: `${landlord} hasn't responded yet. You'll be able to pay once your request is approved — there's nothing to do for now.`,
    },
    APPROVED: {
      title: "Approved — ready for payment",
      body: `Good news! ${landlord} approved your request. Pay${amount} to confirm and activate your rental.`,
      action: (
        <Link href={tenantPaymentPath(request.id)} className={buttonVariants({ className: "w-full sm:w-auto" })}>
          <CreditCard />
          Proceed to payment
        </Link>
      ),
    },
    REJECTED: {
      title: "Request declined",
      body: `${landlord} declined this request. Keep looking — there are plenty of other homes available.`,
      action: (
        <Link href="/properties" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}>
          <Search />
          Browse properties
        </Link>
      ),
    },
    ACTIVE: {
      title: "Active rental",
      body: "Your payment is complete and this is your current home.",
    },
    COMPLETED: {
      title: "Rental completed",
      body: "This rental has ended. It stays here as part of your rental history.",
    },
  };

  const { title, body, action } = content[request.status];

  return (
    <section
      aria-label="Request status"
      className={cn("flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between", box)}
    >
      <div className="flex gap-3">
        <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", iconColor)} />
        <div>
          <h2 className="font-semibold text-stone-900">{title}</h2>
          <div className="mt-1 text-sm text-stone-700">{body}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </section>
  );
}
