"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleCheck, Star } from "lucide-react";
import { StarRating } from "@/components/properties/review-list";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ReviewForm, type SubmittedReview } from "./review-form";

interface LeaveReviewButtonProps {
  propertyId: string;
  propertyTitle: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * "Leave review" for a COMPLETED rental (backend rule). Opens the form in a dialog and shows the
 * reviewed state only after POST /api/reviews succeeds.
 */
export function LeaveReviewButton({
  propertyId,
  propertyTitle,
  variant = "secondary",
  size = "sm",
  className,
}: LeaveReviewButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedReview | null>(null);

  // Refresh server data (rental now shows as reviewed) only when the dialog closes, so the
  // thank-you message isn't unmounted by the re-render while the user is reading it.
  const close = () => {
    setOpen(false);
    if (submitted) router.refresh();
  };

  return (
    <>
      {submitted ? (
        <Badge tone="brand" className={className}>
          <CircleCheck />
          Reviewed
        </Badge>
      ) : (
        <Button variant={variant} size={size} onClick={() => setOpen(true)} className={className}>
          <Star />
          Leave review
        </Button>
      )}

      <Dialog open={open} onClose={close} title="Leave a review" description={propertyTitle}>
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <CircleCheck aria-hidden className="size-6" />
            </div>
            <h3 className="mt-4 font-semibold">Thanks for your review!</h3>
            <p className="mt-1 text-sm text-stone-600">It helps other renters choose their next home.</p>
            <div className="mt-5 rounded-xl border border-stone-200 p-4 text-left">
              <StarRating rating={submitted.rating} />
              <p className="mt-2 text-sm text-stone-700">{submitted.comment}</p>
            </div>
            <Button className="mt-6 w-full" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          open && (
            <ReviewForm
              propertyId={propertyId}
              onCancel={() => setOpen(false)}
              onSubmitted={(review) => {
                setSubmitted(review);
                toast({ title: "Review submitted", description: "Thanks for sharing your experience." });
              }}
            />
          )
        )}
      </Dialog>
    </>
  );
}
