"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ImageOff, ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { cn, isOptimizableImage } from "@/lib/utils";

interface ImageUrlManagerProps {
  /** Image URLs in display order; the first one is the cover photo. */
  value: string[];
  onChange: (urls: string[]) => void;
  invalid?: boolean;
  describedBy?: string;
  max?: number;
}

function validateUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? null : "Use a link that starts with https://";
  } catch {
    return "That doesn't look like a valid image link.";
  }
}

/**
 * Photo manager for the mock phase: landlords paste hosted image URLs.
 * Later, an upload widget (e.g. Cloudinary) can feed returned URLs into the same `onChange`.
 */
export function ImageUrlManager({ value, onChange, invalid, describedBy, max = 10 }: ImageUrlManagerProps) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const full = value.length >= max;

  const add = () => {
    const url = draft.trim();
    if (!url) return setInputError("Paste an image link first.");
    const error = validateUrl(url);
    if (error) return setInputError(error);
    if (value.includes(url)) return setInputError("You've already added this image.");
    onChange([...value, url]);
    setDraft("");
    setInputError(null);
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));
  const makeCover = (url: string) => onChange([url, ...value.filter((u) => u !== url)]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>Image URL</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={inputId}
            type="url"
            inputMode="url"
            value={draft}
            disabled={full}
            placeholder="https://images.unsplash.com/photo-…"
            onChange={(e) => {
              setDraft(e.target.value);
              setInputError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // add the image instead of submitting the whole form
                add();
              }
            }}
            aria-invalid={inputError || invalid ? true : undefined}
            aria-describedby={[inputError ? `${inputId}-error` : null, describedBy].filter(Boolean).join(" ") || undefined}
          />
          <Button variant="outline" onClick={add} disabled={full} className="shrink-0">
            <ImagePlus />
            Add image
          </Button>
        </div>
        <FieldError id={`${inputId}-error`}>{inputError}</FieldError>
        <p className="text-sm text-stone-500">
          {full
            ? `You've reached the limit of ${max} photos.`
            : "Paste a link to a hosted photo and press Add. The first photo is used as the cover. Direct photo uploads are coming soon."}
        </p>
      </div>

      {value.length > 0 ? (
        <ul aria-label="Added photos" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, i) => (
            <li key={url} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <div className="relative aspect-4/3 bg-stone-100">
                {broken.has(url) ? (
                  <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-stone-500">
                    <ImageOff aria-hidden className="size-5" />
                    Preview unavailable — check the link
                  </div>
                ) : (
                  <Image
                    src={url}
                    alt={`Photo ${i + 1}`}
                    fill
                    sizes="(min-width: 640px) 200px, 50vw"
                    unoptimized={!isOptimizableImage(url)}
                    onError={() => setBroken((prev) => new Set(prev).add(url))}
                    className="object-cover"
                  />
                )}
                {i === 0 && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-xs font-medium text-stone-800 shadow-sm">
                    <Star aria-hidden className="size-3 fill-amber-400 text-amber-400" />
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                {i === 0 ? (
                  <span className="px-1.5 text-xs text-stone-500">Cover photo</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(url)}
                    className="rounded-md px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    aria-label={`Make photo ${i + 1} the cover`}
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  aria-label={`Remove photo ${i + 1}`}
                  title="Remove photo"
                  className="flex size-8 items-center justify-center rounded-md text-stone-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center text-sm",
            invalid ? "border-red-300 bg-red-50/40 text-red-700" : "border-stone-300 text-stone-500",
          )}
        >
          <ImagePlus aria-hidden className="mb-2 size-6" />
          No photos yet. Listings with clear photos get more requests.
        </div>
      )}
    </div>
  );
}
