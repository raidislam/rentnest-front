"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { Bath, BedDouble, ClipboardList, Eye, Hourglass, LoaderCircle, MapPin, Maximize2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Property } from "@/lib/types";
import { cn, formatPrice, isOptimizableImage, propertyTypeLabel } from "@/lib/utils";

interface LandlordPropertyCardProps {
  property: Property;
  requestCount: number;
  pendingCount: number;
  onToggleAvailability: (next: boolean) => void;
  togglingAvailability: boolean;
  onDelete: () => void;
}

/** Management version of the property card: same visual language as the public card, plus landlord actions. */
export function LandlordPropertyCard({
  property,
  requestCount,
  pendingCount,
  onToggleAvailability,
  togglingAvailability,
  onDelete,
}: LandlordPropertyCardProps) {
  const labelId = useId();
  const { id, title, location, price, type, bedrooms, bathrooms, areaSqft, images, isAvailable, status } = property;
  const isPublic = status === "APPROVED";

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="relative aspect-16/10 bg-stone-100">
        <Image
          src={images[0]}
          alt=""
          fill
          sizes="(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw"
          unoptimized={!isOptimizableImage(images[0])}
          className="object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge tone="white">{propertyTypeLabel(type)}</Badge>
          {status === "PENDING" && (
            <Badge tone="amber">
              <Hourglass />
              Pending review
            </Badge>
          )}
          {status === "REJECTED" && <Badge tone="red">Not approved</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-semibold text-stone-900">
          {formatPrice(price)}
          <span className="text-sm font-normal text-stone-500"> /month</span>
        </p>
        <h3 className="mt-0.5 line-clamp-2 font-medium text-stone-900">{title}</h3>
        {status === "REJECTED" && property.moderationNote && (
          <p className="mt-1 rounded-md bg-red-50 px-2 py-1 text-sm text-red-800">Not approved: {property.moderationNote}</p>
        )}
        <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
          <MapPin aria-hidden className="size-4 shrink-0 text-stone-400" />
          <span className="truncate">
            {location.area}, {location.city}
          </span>
        </p>
        <ul aria-label="Property size" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
          <li className="flex items-center gap-1.5">
            <BedDouble aria-hidden className="size-4 text-stone-400" />
            {bedrooms} bd
          </li>
          <li className="flex items-center gap-1.5">
            <Bath aria-hidden className="size-4 text-stone-400" />
            {bathrooms} ba
          </li>
          <li className="flex items-center gap-1.5">
            <Maximize2 aria-hidden className="size-4 text-stone-400" />
            {areaSqft.toLocaleString("en-IN")} sqft
          </li>
        </ul>

        <Link
          href="/dashboard/landlord/requests"
          className="mt-3 flex items-center gap-1.5 self-start rounded py-0.5 text-sm text-stone-600 hover:text-brand-700"
        >
          <ClipboardList aria-hidden className="size-4 text-stone-400" />
          {requestCount} {requestCount === 1 ? "request" : "requests"}
          {pendingCount > 0 && <span className="font-medium text-amber-700">· {pendingCount} pending</span>}
        </Link>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2.5">
          <div className="min-w-0">
            <p id={labelId} className="text-sm font-medium text-stone-900">
              {isAvailable ? "Available" : "Unavailable"}
            </p>
            <p className="text-xs text-stone-500">{isAvailable ? "Accepting requests" : "Not accepting requests"}</p>
          </div>
          <div className="flex items-center gap-2">
            {togglingAvailability && <LoaderCircle aria-label="Saving" className="size-4 animate-spin text-stone-400" />}
            <Switch
              checked={isAvailable}
              onCheckedChange={onToggleAvailability}
              disabled={togglingAvailability}
              aria-labelledby={labelId}
            />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
          {isPublic ? (
            <Link href={`/properties/${id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Eye />
              View
              <span className="sr-only">{title}</span>
            </Link>
          ) : (
            <span
              title="Visible to renters after approval"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}
              aria-disabled
            >
              <Eye />
              View
            </span>
          )}
          <Link href={`/dashboard/landlord/properties/${id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Pencil />
            Edit
            <span className="sr-only">{title}</span>
          </Link>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-700 hover:border-red-300 hover:bg-red-50">
            <Trash2 />
            Delete
            <span className="sr-only">{title}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
