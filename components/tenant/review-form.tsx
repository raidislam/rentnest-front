"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, FormField, Textarea, fieldAria } from "@/components/ui/field";
import { submitReview } from "@/lib/mock-api";
import type { Review } from "@/lib/types";
import { StarRatingInput } from "./star-rating-input";

const COMMENT_MIN = 20;
const COMMENT_MAX = 600;

const schema = z.object({
  rating: z.number().int().min(1, "Choose a rating from 1 to 5 stars.").max(5, "Choose a rating from 1 to 5 stars."),
  comment: z
    .string()
    .trim()
    .min(COMMENT_MIN, `Please write at least ${COMMENT_MIN} characters so other renters find it useful.`)
    .max(COMMENT_MAX, `Keep your review under ${COMMENT_MAX} characters.`),
});

type FormValues = z.infer<typeof schema>;

interface ReviewFormProps {
  rentalRequestId: string;
  propertyId: string;
  onSubmitted: (review: Review) => void;
  onCancel: () => void;
}

export function ReviewForm({ rentalRequestId, propertyId, onSubmitted, onCancel }: ReviewFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { rating: 0, comment: "" },
  });
  const commentLength = useWatch({ control, name: "comment" })?.length ?? 0;

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const review = await submitReview({ ...values, propertyId, rentalRequestId });
      onSubmitted(review);
    } catch {
      setSubmitError("We couldn't submit your review right now. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {submitError && (
        <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <CircleAlert aria-hidden className="size-5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <div>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <StarRatingInput
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.rating}
              describedBy={errors.rating ? "review-rating-error" : undefined}
            />
          )}
        />
        <FieldError id="review-rating-error" className="mt-1">
          {errors.rating?.message}
        </FieldError>
      </div>

      <FormField id="review-comment" label="Your review" error={errors.comment?.message}>
        <Textarea
          id="review-comment"
          rows={5}
          maxLength={COMMENT_MAX}
          placeholder="What was it like living here? Mention the building, neighbourhood and how responsive the landlord was."
          {...fieldAria("review-comment", errors.comment)}
          {...register("comment")}
        />
        <FieldHint className="text-right text-xs">
          {commentLength}/{COMMENT_MAX}
        </FieldHint>
      </FormField>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" />}
          {isSubmitting ? "Submitting review…" : "Submit review"}
        </Button>
      </div>
    </form>
  );
}
