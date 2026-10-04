"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldHint, FormField, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { submitRentalRequest } from "@/lib/mock-api";
import { formatPrice } from "@/lib/utils";

const DURATIONS = ["3", "6", "12", "24"] as const;
const MESSAGE_MAX = 500;

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .refine((v) => /^(\+?880|0)1[3-9]\d{8}$/.test(v.replace(/[\s-]/g, "")), "Enter a valid Bangladeshi mobile number, e.g. 01712-345678."),
  moveInDate: z
    .string()
    .min(1, "Choose your preferred move-in date.")
    .refine((v) => v >= todayISO(), "Move-in date can't be in the past."),
  durationMonths: z.enum(DURATIONS, { error: "Choose a rental duration." }),
  message: z
    .string()
    .trim()
    .min(20, "Tell the landlord a little about yourself (at least 20 characters).")
    .max(MESSAGE_MAX, `Keep your message under ${MESSAGE_MAX} characters.`),
});

type FormValues = z.infer<typeof schema>;

interface RentalRequestFormProps {
  property: { id: string; title: string; price: number };
  landlordName: string;
  onCancel: () => void;
}

export function RentalRequestForm({ property, landlordName, onCancel }: RentalRequestFormProps) {
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", phone: "", moveInDate: "", durationMonths: "12", message: "" },
  });

  const messageLength = useWatch({ control, name: "message" })?.length ?? 0;

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await submitRentalRequest({ ...values, propertyId: property.id, durationMonths: Number(values.durationMonths) });
      setSubmitted(values);
      toast({ title: "Rental request sent", description: `${landlordName} will review your request soon.` });
    } catch {
      setSubmitError("We couldn't send your request right now. Please check your connection and try again.");
      toast({ title: "Request not sent", description: "Something went wrong. Please try again.", variant: "error" });
    }
  };

  if (submitted) {
    return (
      <div className="py-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <CircleCheck aria-hidden className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Request sent to {landlordName}</h3>
        <p className="mt-1 text-sm text-stone-600">
          Your request is now <span className="font-medium text-amber-700">pending</span>. You&apos;ll be able to pay once the
          landlord approves it.
        </p>
        <dl className="mt-5 divide-y divide-stone-100 rounded-xl border border-stone-200 text-left text-sm">
          {[
            ["Property", property.title],
            ["Move-in date", new Date(submitted.moveInDate).toLocaleDateString("en-GB", { dateStyle: "medium" })],
            ["Duration", `${submitted.durationMonths} months`],
            ["Monthly rent", formatPrice(property.price)],
          ].map(([term, detail]) => (
            <div key={term} className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-stone-500">{term}</dt>
              <dd className="text-right font-medium text-stone-900">{detail}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/tenant/requests" className={buttonVariants({ className: "flex-1" })}>
            View my requests
          </Link>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Keep browsing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {submitError && (
        <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <CircleAlert aria-hidden className="size-5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="rr-name" label="Full name" error={errors.fullName?.message} className="sm:col-span-2">
          <Input id="rr-name" autoFocus autoComplete="name" {...fieldAria("rr-name", errors.fullName)} {...register("fullName")} />
        </FormField>
        <FormField id="rr-email" label="Email" error={errors.email?.message}>
          <Input id="rr-email" type="email" autoComplete="email" {...fieldAria("rr-email", errors.email)} {...register("email")} />
        </FormField>
        <FormField id="rr-phone" label="Mobile number" error={errors.phone?.message}>
          <Input
            id="rr-phone"
            type="tel"
            autoComplete="tel"
            placeholder="01712-345678"
            {...fieldAria("rr-phone", errors.phone)}
            {...register("phone")}
          />
        </FormField>
        <FormField id="rr-date" label="Preferred move-in date" error={errors.moveInDate?.message}>
          <Input id="rr-date" type="date" min={todayISO()} {...fieldAria("rr-date", errors.moveInDate)} {...register("moveInDate")} />
        </FormField>
        <FormField id="rr-duration" label="Rental duration" error={errors.durationMonths?.message}>
          <Select id="rr-duration" {...fieldAria("rr-duration", errors.durationMonths)} {...register("durationMonths")}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} months
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="rr-message" label={`Message to ${landlordName}`} error={errors.message?.message} className="sm:col-span-2">
          <Textarea
            id="rr-message"
            rows={4}
            maxLength={MESSAGE_MAX}
            placeholder="Introduce yourself — who will live here, your work, and any questions about the property."
            {...fieldAria("rr-message", errors.message)}
            {...register("message")}
          />
          <FieldHint className="text-right text-xs">
            {messageLength}/{MESSAGE_MAX}
          </FieldHint>
        </FormField>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-3 text-sm">
        <span className="text-stone-600">Monthly rent</span>
        <span className="font-semibold">{formatPrice(property.price)}</span>
      </div>
      <p className="text-xs text-stone-500">
        You won&apos;t be charged now. Payment is only requested after the landlord approves your request.
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />}
          {isSubmitting ? "Sending request…" : "Send request"}
        </Button>
      </div>
    </form>
  );
}

