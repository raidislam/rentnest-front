"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { logoutRequest } from "@/lib/api/auth-client";
import { toApiError } from "@/lib/api/errors";

interface LogoutButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Where to go after logging out. Omit to stay on the current page and refresh it. */
  redirectTo?: string;
}

/** Clears the HttpOnly session cookie via POST /api/auth/logout, then refreshes server-rendered UI. */
export function LogoutButton({ variant = "ghost", size = "md", className, redirectTo }: LogoutButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    setPending(true);
    try {
      await logoutRequest();
      if (redirectTo) router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setPending(false);
      toast({ title: "Couldn't log out", description: toApiError(error).message, variant: "error" });
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={logout} disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" /> : <LogOut />}
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
