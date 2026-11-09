"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, Input, fieldAria } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { loginRequest } from "@/lib/api/auth-client";
import { applyFieldErrors, toApiError } from "@/lib/api/errors";
import { postLoginPath } from "@/lib/auth/redirects";
import { PasswordInput } from "./password-input";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const FORM_FIELDS = ["email", "password"] as const;

interface LoginFormProps {
  /** Path to return to after login (from ?next=), validated by postLoginPath(). */
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async ({ email, password, remember }: FormValues) => {
    setServerError(null);
    try {
      // Sets the HttpOnly session cookie; "Remember me" off = cookie ends with the browser session.
      const user = await loginRequest({ email, password, remember });
      toast({ title: `Welcome back, ${user.name.split(" ")[0]}`, description: "Taking you to your dashboard…" });
      setRedirecting(true);
      router.replace(postLoginPath(next, user.role));
      router.refresh();
    } catch (err) {
      const error = toApiError(err);
      // 400 validation errors go on their fields; 401 (wrong credentials), 403 (banned) and
      // connection problems show the backend's message in the banner.
      if (!applyFieldErrors(error, setError, {}, FORM_FIELDS)) setServerError(error.message);
    }
  };

  const busy = isSubmitting || redirecting;

  return (
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

      {/* "Forgot password?" is hidden: the backend has no password reset endpoint yet. */}
      <div className="flex items-center gap-2.5">
        <input id="remember" type="checkbox" className="size-4 rounded accent-brand-700" {...register("remember")} />
        <label htmlFor="remember" className="text-sm text-stone-700">
          Remember me
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <LoaderCircle className="animate-spin" /> : <LogIn />}
        {redirecting ? "Redirecting…" : isSubmitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
