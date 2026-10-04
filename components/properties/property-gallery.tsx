"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <section aria-label="Photo gallery" aria-roledescription="carousel">
      <div
        className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-200 sm:aspect-16/10"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${title} — photo ${index + 1} of ${count}`}
          fill
          preload={index === 0}
          sizes="(min-width: 1280px) 800px, (min-width: 1024px) 62vw, 100vw"
          className="animate-fade-in object-cover"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm transition hover:bg-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm transition hover:bg-white"
            >
              <ChevronRight className="size-5" />
            </button>
            <p
              aria-live="polite"
              className="absolute right-3 bottom-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white"
            >
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-4/3 w-full overflow-hidden rounded-lg bg-stone-200 transition",
                  i === index ? "ring-2 ring-brand-600 ring-offset-2" : "opacity-75 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="(min-width: 1024px) 180px, 25vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
