"use client";

import { useState } from "react";
import { z } from "zod";
import { LoaderCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, fieldAria } from "@/components/ui/field";
import { requestPasswordReset } from "@/lib/mock-api";

const emailSchema = z.email("Enter a valid email address.");

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ForgotPasswordDialog({ open, onClose, defaultEmail = "" }: ForgotPasswordDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reset your password"
      description="We'll email you a link to choose a new password."
    >
      {/* Mounted only while open so it resets each time. */}
      {open && <ResetForm defaultEmail={defaultEmail} onClose={onClose} />}
    </Dialog>
  );
}

function ResetForm({ defaultEmail, onClose }: { defaultEmail: string; onClose: () => void }) {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <MailCheck aria-hidden className="size-6" />
        </div>
        <h3 className="mt-4 font-semibold">Check your inbox</h3>
        <p role="status" className="mt-1 text-sm text-stone-600">
          If an account exists for <span className="font-medium text-stone-900">{email}</span>, you&apos;ll receive a
          reset link within a few minutes.
        </p>
        <Button className="mt-6 w-full" onClick={onClose}>
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const result = emailSchema.safeParse(email.trim());
        if (!result.success) {
          setError(result.error.issues[0].message);
          return;
        }
        setError(undefined);
        setStatus("sending");
        await requestPasswordReset(result.data);
        setStatus("sent");
      }}
    >
      <FormField id="reset-email" label="Email" error={error}>
        <Input
          id="reset-email"
          type="email"
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...fieldAria("reset-email", error)}
        />
      </FormField>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={status === "sending"}>
          Cancel
        </Button>
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" && <LoaderCircle className="animate-spin" />}
          {status === "sending" ? "Sending link…" : "Send reset link"}
        </Button>
      </div>
    </form>
  );
}
