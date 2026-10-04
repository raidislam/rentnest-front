"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, CircleAlert, LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, Input, fieldAria } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DEMO_PASSWORD, MockApiError, loginUser } from "@/lib/mock-api";
import type { Role } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";
import { ForgotPasswordDialog } from "./forgot-password-dialog";
import { PasswordInput } from "./password-input";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export interface DemoAccount {
  role: Role;
  name: string;
  email: string;
}

const roleLabel: Record<Role, string> = { TENANT: "Tenant", LANDLORD: "Landlord", ADMIN: "Admin" };

export function LoginForm({ demoAccounts }: { demoAccounts: DemoAccount[] }) {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async ({ email, password }: FormValues) => {
    setServerError(null);
    try {
      const user = await loginUser(email, password);
      toast({ title: `Welcome back, ${user.name.split(" ")[0]}`, description: "Taking you to your dashboard…" });
      setRedirecting(true);
      router.push(dashboardPath(user.role));
    } catch (err) {
      setServerError(err instanceof MockApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const fillDemo = (account: DemoAccount) => {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
    setServerError(null);
  };

  const busy = isSubmitting || redirecting;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && (
          <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <CircleAlert aria-hidden className="size-5 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

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
              autoComplete="current-password"
              {...fieldAria("password", errors.password)}
              {...register("password")}
            />
        </FormField>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <input id="remember" type="checkbox" className="size-4 rounded accent-brand-700" {...register("remember")} />
            <label htmlFor="remember" className="text-sm text-stone-700">
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="rounded py-0.5 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" /> : <LogIn />}
          {redirecting ? "Redirecting…" : isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      {demoAccounts.length > 0 && (
        <details className="group mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/60">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-stone-700 [&::-webkit-details-marker]:hidden">
            Use a demo account
            <ChevronDown aria-hidden className="size-4 text-stone-500 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4">
            <p className="text-xs text-stone-500">
              Authentication isn&apos;t connected yet. Pick a role to fill in its credentials (password:{" "}
              <code className="font-mono">{DEMO_PASSWORD}</code>).
            </p>
            <ul className="mt-3 space-y-2">
              {demoAccounts.map((account) => (
                <li key={account.role}>
                  <button
                    type="button"
                    onClick={() => fillDemo(account)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-stone-900">{roleLabel[account.role]}</span>
                      <span className="block truncate text-stone-500">{account.email}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-brand-700">Fill in</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} defaultEmail={getValues("email")} />
    </>
  );
}
