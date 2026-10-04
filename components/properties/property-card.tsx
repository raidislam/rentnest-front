import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Maximize2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { cn, formatPrice, propertyTypeLabel } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  rating?: { average: number; count: number };
  /** Preload the image when the card is above the fold. */
  preload?: boolean;
  className?: string;
}

export function PropertyCard({ property, rating, preload = false, className }: PropertyCardProps) {
  const { id, title, location, price, type, bedrooms, bathrooms, areaSqft, amenities, images, isAvailable } = property;
  const href = `/properties/${id}`;
  const shownAmenities = amenities.slice(0, 3);
  const extraAmenities = amenities.length - shownAmenities.length;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-4/3 overflow-hidden bg-stone-100">
        <Image
          src={images[0]}
          alt=""
          fill
          preload={preload}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge tone="white">{propertyTypeLabel(type)}</Badge>
          {!isAvailable && <Badge tone="white" className="text-stone-500">Rented</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-semibold text-stone-900">
            {formatPrice(price)}
            <span className="text-sm font-normal text-stone-500"> /month</span>
          </p>
          {rating && rating.count > 0 && (
            <p className="flex items-center gap-1 pt-1 text-sm text-stone-700">
              <Star aria-hidden className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{rating.average.toFixed(1)}</span>
              <span className="text-stone-500">({rating.count})</span>
              <span className="sr-only">average rating from {rating.count} reviews</span>
            </p>
          )}
        </div>

        <h3 className="mt-1 line-clamp-2 font-medium text-stone-900">
          <Link href={href} className="rounded hover:text-brand-700">
            {title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
          <MapPin aria-hidden className="size-4 shrink-0 text-stone-400" />
          <span className="truncate">
            {location.area}, {location.city}
          </span>
        </p>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700" aria-label="Property size">
          <li className="flex items-center gap-1.5">
            <BedDouble aria-hidden className="size-4 text-stone-400" />
            {bedrooms} {bedrooms === 1 ? "bed" : "beds"}
          </li>
          <li className="flex items-center gap-1.5">
            <Bath aria-hidden className="size-4 text-stone-400" />
            {bathrooms} {bathrooms === 1 ? "bath" : "baths"}
          </li>
          <li className="flex items-center gap-1.5">
            <Maximize2 aria-hidden className="size-4 text-stone-400" />
            {areaSqft.toLocaleString("en-IN")} sqft
          </li>
        </ul>

        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Amenities">
          {shownAmenities.map((a) => (
            <li key={a}>
              <Badge>{a}</Badge>
            </li>
          ))}
          {extraAmenities > 0 && (
            <li>
              <Badge className="text-stone-500">+{extraAmenities} more</Badge>
            </li>
          )}
        </ul>

        <div className="mt-auto pt-4">
          <Link href={href} className={buttonVariants({ variant: "outline", className: "w-full" })}>
            View details
            <span className="sr-only">for {title}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
