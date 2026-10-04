"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, CircleAlert, House, LoaderCircle, PartyPopper } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError, FormField, Input, fieldAria } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { MockApiError, registerUser } from "@/lib/mock-api";
import { cn, dashboardPath } from "@/lib/utils";
import { PASSWORD_RULES, PasswordRequirements } from "./password-requirements";
import { PasswordInput } from "./password-input";

const ROLES = [
  {
    value: "TENANT",
    icon: House,
    title: "I want to rent",
    description: "Browse homes, send rental requests and pay rent online.",
  },
  {
    value: "LANDLORD",
    icon: Building2,
    title: "I'm a landlord",
    description: "List properties and manage tenant requests and payments.",
  },
] as const;

const schema = z
  .object({
    role: z.enum(["TENANT", "LANDLORD"], { error: "Choose how you'll use RentNest." }),
    name: z.string().trim().min(2, "Please enter your full name."),
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(1, "Create a password.")
      .refine((v) => PASSWORD_RULES.every((r) => r.test(v)), "Your password doesn't meet all the requirements yet."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    terms: z.boolean().refine((v) => v, "You need to accept the terms to create an account."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm({ defaultRole }: { defaultRole: FormValues["role"] }) {
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [account, setAccount] = useState<{ name: string; role: FormValues["role"] } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { role: defaultRole, name: "", email: "", password: "", confirmPassword: "", terms: false },
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = async ({ name, email, password, role }: FormValues) => {
    setServerError(null);
    try {
      await registerUser({ name, email, password, role });
      setAccount({ name, role });
      toast({ title: "Account created", description: "Welcome to RentNest!" });
    } catch (err) {
      setServerError(err instanceof MockApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (account) {
    const firstName = account.name.split(" ")[0];
    const isLandlord = account.role === "LANDLORD";
    return (
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <PartyPopper aria-hidden className="size-7" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Welcome to RentNest, {firstName}!</h2>
        <p className="mt-2 text-stone-600">
          Your {isLandlord ? "landlord" : "tenant"} account is ready.{" "}
          {isLandlord ? "Start by listing your first property." : "Start exploring homes that fit your budget."}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={dashboardPath(account.role)} className={buttonVariants({ size: "lg" })}>
            Go to my dashboard
          </Link>
          <Link
            href={isLandlord ? "/dashboard/landlord/properties/new" : "/properties"}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {isLandlord ? "Add a property" : "Browse properties"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <CircleAlert aria-hidden className="size-5 shrink-0" />
          <p>
            {serverError}{" "}
            {serverError.includes("already exists") && (
              <Link href="/auth/login" className="font-medium underline underline-offset-2">
                Log in
              </Link>
            )}
          </p>
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">How will you use RentNest?</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {ROLES.map(({ value, icon: Icon, title, description }) => (
            <div key={value} className="relative">
              <input
                id={`role-${value}`}
                type="radio"
                value={value}
                defaultChecked={value === defaultRole}
                className="peer sr-only"
                {...register("role")}
              />
              <label
                htmlFor={`role-${value}`}
                className={cn(
                  "flex h-full cursor-pointer flex-col gap-2 rounded-xl border border-stone-300 bg-white p-4 transition-colors hover:border-stone-400",
                  "peer-checked:border-brand-600 peer-checked:bg-brand-50/60 peer-checked:ring-1 peer-checked:ring-brand-600",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600",
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-stone-200">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="font-medium text-stone-900">{title}</span>
                <span className="text-sm text-stone-600">{description}</span>
              </label>
            </div>
          ))}
        </div>
        <FieldError className="mt-1.5">{errors.role?.message}</FieldError>
      </fieldset>

      <FormField id="name" label="Full name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...fieldAria("name", errors.name)} {...register("name")} />
      </FormField>

      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...fieldAria("email", errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error password-rules" : "password-rules"}
          {...register("password")}
        />
        <div className="pt-1">
          <PasswordRequirements id="password-rules" value={password} />
        </div>
      </FormField>

      <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...fieldAria("confirmPassword", errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </FormField>

      <div>
        <div className="flex items-start gap-2.5">
          <input
            id="terms"
            type="checkbox"
            className="mt-0.5 size-4 rounded border-stone-300 accent-brand-700"
            {...fieldAria("terms", errors.terms)}
            {...register("terms")}
          />
          <label htmlFor="terms" className="text-sm text-stone-700">
            I agree to the RentNest Terms of Service and Privacy Policy.
          </label>
        </div>
        <FieldError id="terms-error" className="mt-1.5">
          {errors.terms?.message}
        </FieldError>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircle className="animate-spin" />}
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
