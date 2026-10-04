"use client";

import { useState } from "react";
import { CircleCheck, Star } from "lucide-react";
import { StarRating } from "@/components/properties/review-list";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import type { Review } from "@/lib/types";
import { ReviewForm } from "./review-form";

interface LeaveReviewButtonProps {
  rentalRequestId: string;
  propertyId: string;
  propertyTitle: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** "Leave review" button that opens the review form in a dialog and shows a reviewed state afterwards. */
export function LeaveReviewButton({
  rentalRequestId,
  propertyId,
  propertyTitle,
  variant = "secondary",
  size = "sm",
  className,
}: LeaveReviewButtonProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<Review | null>(null);

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

      <Dialog open={open} onClose={() => setOpen(false)} title="Leave a review" description={propertyTitle}>
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
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          open && (
            <ReviewForm
              rentalRequestId={rentalRequestId}
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
