"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  name: string;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * 1–5 star picker built on native radio inputs, so arrow keys, Tab and screen
 * readers work out of the box. Hovering previews a rating.
 */
export function StarRatingInput({ value, onChange, onBlur, name, invalid, describedBy }: StarRatingInputProps) {
  const id = useId();
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset aria-describedby={describedBy} aria-invalid={invalid || undefined}>
      <legend className="text-sm font-medium text-stone-800">Your rating</legend>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {RATING_LABELS.map((label, i) => {
            const rating = i + 1;
            const inputId = `${id}-${rating}`;
            return (
              <div key={rating}>
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={rating}
                  checked={value === rating}
                  onChange={() => onChange(rating)}
                  onBlur={onBlur}
                  className="peer sr-only"
                />
                <label
                  htmlFor={inputId}
                  onMouseEnter={() => setHover(rating)}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-md peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600"
                >
                  <Star
                    aria-hidden
                    className={cn(
                      "size-8 transition-colors",
                      rating <= shown ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-300",
                    )}
                  />
                  <span className="sr-only">
                    {rating} {rating === 1 ? "star" : "stars"} – {label}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        <span aria-hidden className={cn("text-sm font-medium", shown ? "text-stone-800" : "text-stone-400")}>
          {shown ? RATING_LABELS[shown - 1] : "Select a rating"}
        </span>
      </div>
    </fieldset>
  );
}
