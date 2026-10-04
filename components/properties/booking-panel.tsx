"use client";

import { useState } from "react";
import { CalendarCheck, CircleCheck, Clock, ShieldCheck } from "lucide-react";
import { RentalRequestForm } from "@/components/forms/rental-request-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";

interface BookingPanelProps {
  property: { id: string; title: string; price: number };
  landlordName: string;
  /** Why requests are disabled, if they are. */
  unavailableReason?: string;
  /** "card" = sidebar card, "bar" = sticky bottom bar for small screens. */
  variant?: "card" | "bar";
}

export function BookingPanel({ property, landlordName, unavailableReason, variant = "card" }: BookingPanelProps) {
  const [open, setOpen] = useState(false);
  const canRequest = !unavailableReason;

  const cta = (
    <Button size="lg" className="w-full" onClick={() => setOpen(true)} disabled={!canRequest}>
      <CalendarCheck />
      {canRequest ? "Request to rent" : "Not available"}
    </Button>
  );

  const dialog = (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Request to rent"
      description={property.title}
      className="max-w-xl"
    >
      {/* Mounted only while open so each request starts fresh. */}
      {open && <RentalRequestForm property={property} landlordName={landlordName} onCancel={() => setOpen(false)} />}
    </Dialog>
  );

  if (variant === "bar") {
    return (
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="font-semibold text-stone-900">
            {formatPrice(property.price)}
            <span className="text-sm font-normal text-stone-500"> /month</span>
          </p>
          <Button onClick={() => setOpen(true)} disabled={!canRequest}>
            {canRequest ? "Request to rent" : "Not available"}
          </Button>
        </div>
        {dialog}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-2xl font-semibold text-stone-900">
            {formatPrice(property.price)}
            <span className="text-base font-normal text-stone-500"> /month</span>
          </p>
          {canRequest ? (
            <Badge tone="brand">
              <CircleCheck />
              Available
            </Badge>
          ) : (
            <Badge tone="neutral">
              <Clock />
              Unavailable
            </Badge>
          )}
        </div>

        <div className="mt-5">{cta}</div>
        {unavailableReason ? (
          <p className="mt-3 text-center text-sm text-stone-600">{unavailableReason}</p>
        ) : (
          <p className="mt-3 text-center text-sm text-stone-500">Free to request · no payment until approved</p>
        )}

        <ul className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm text-stone-600">
          <li className="flex gap-3">
            <CalendarCheck aria-hidden className="size-4 shrink-0 text-brand-600" />
            Choose your move-in date and rental duration
          </li>
          <li className="flex gap-3">
            <ShieldCheck aria-hidden className="size-4 shrink-0 text-brand-600" />
            Pay securely online after the landlord approves
          </li>
        </ul>
      </div>

      {dialog}
    </>
  );
}
