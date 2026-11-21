"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleCheckBig } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { browserApi } from "@/lib/api/browser";
import { toApiError } from "@/lib/api/errors";
import { completeRental } from "@/lib/api/services/rentals";

interface CompleteRentalButtonProps {
  rentalRequestId: string;
  propertyTitle?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * "Mark as completed" for an ACTIVE rental: PATCH /api/rentals/:id/complete (no body).
 * The status changes only after the backend confirms; then the tenant can leave a review.
 */
export function CompleteRentalButton({ rentalRequestId, propertyTitle, variant = "outline", size = "md", className }: CompleteRentalButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const complete = async () => {
    setConfirming(false);
    setSaving(true);
    try {
      await completeRental(browserApi, rentalRequestId);
      toast({ title: "Rental marked as completed", description: "You can now leave a review for this home." });
      router.refresh();
    } catch (err) {
      // 400 (not ACTIVE), 403 (not yours), 404, network: show the backend's message; nothing changes.
      toast({ title: "Couldn't complete rental", description: toApiError(err).message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setConfirming(true)} disabled={saving}>
        <CircleCheckBig />
        {saving ? "Saving…" : "Mark as completed"}
      </Button>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={complete}
        title="Mark this rental as completed?"
        subtitle={propertyTitle}
        confirmLabel="Mark as completed"
        confirmIcon={<CircleCheckBig />}
        tone="primary"
      >
        <p>Do this when your rental has ended. Completed rentals stay in your history, and you&apos;ll be able to review the property.</p>
      </ConfirmDialog>
    </>
  );
}
