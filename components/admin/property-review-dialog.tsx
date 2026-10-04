"use client";

import Image from "next/image";
import { useState } from "react";
import { Bath, BedDouble, Check, House, MapPin, Maximize2, X } from "lucide-react";
import { AmenityList } from "@/components/properties/amenity-list";
import type { WithSaving } from "@/components/dashboard/use-optimistic-patch";
import { Avatar } from "@/components/shared/avatar";
import { PropertyStatusBadge } from "@/components/shared/moderation-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { AdminPropertyView } from "@/lib/types";
import { cn, formatDate, formatPrice, isOptimizableImage, propertyTypeLabel } from "@/lib/utils";

interface PropertyReviewDialogProps {
  property: WithSaving<AdminPropertyView> | null;
  onClose: () => void;
  onApprove: (property: AdminPropertyView) => void;
  onReject: (property: AdminPropertyView) => void;
}

/** Everything an admin needs to make a moderation decision, without leaving the list. */
export function PropertyReviewDialog({ property, onClose, onApprove, onReject }: PropertyReviewDialogProps) {
  const canDecide = property?.status === "PENDING" && !property.saving;

  return (
    <Dialog
      open={!!property}
      onClose={onClose}
      title="Review listing"
      description={property ? `Submitted ${formatDate(property.createdAt)}` : undefined}
      className="max-w-2xl"
      footer={
        canDecide && property ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onReject(property)} className="text-red-700 hover:border-red-300 hover:bg-red-50">
              <X />
              Reject
            </Button>
            <Button onClick={() => onApprove(property)}>
              <Check />
              Approve listing
            </Button>
          </div>
        ) : undefined
      }
    >
      {property && <ReviewBody key={property.id} property={property} />}
    </Dialog>
  );
}

function ReviewBody({ property }: { property: AdminPropertyView }) {
  const [active, setActive] = useState(0);
  const image = property.images[active] ?? property.images[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-stone-100">
          <Image
            src={image}
            alt={`${property.title} — photo ${active + 1} of ${property.images.length}`}
            fill
            sizes="(min-width: 672px) 620px, 100vw"
            unoptimized={!isOptimizableImage(image)}
            className="object-cover"
          />
        </div>
        {property.images.length > 1 && (
          <ul className="mt-2 grid grid-cols-5 gap-2">
            {property.images.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === active}
                  className={cn(
                    "relative block aspect-4/3 w-full overflow-hidden rounded-md bg-stone-100",
                    i === active ? "ring-2 ring-brand-600 ring-offset-1" : "opacity-75 hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill sizes="120px" unoptimized={!isOptimizableImage(src)} className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <PropertyStatusBadge status={property.status} />
          <Badge tone={property.isAvailable ? "brand" : "neutral"}>{property.isAvailable ? "Available" : "Unavailable"}</Badge>
        </div>
        <h3 className="mt-2 text-xl font-semibold text-stone-900">{property.title}</h3>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
          {property.location.address}, {property.location.area}, {property.location.city}
        </p>
        {property.status === "REJECTED" && property.moderationNote && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">Rejection reason: {property.moderationNote}</p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Rent", value: `${formatPrice(property.price)}/mo`, icon: null },
          { label: "Type", value: propertyTypeLabel(property.type), icon: House },
          { label: "Bedrooms", value: property.bedrooms, icon: BedDouble },
          { label: "Bathrooms", value: property.bathrooms, icon: Bath },
          { label: "Size", value: `${property.areaSqft.toLocaleString("en-IN")} sqft`, icon: Maximize2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-stone-200 p-3">
            <dt className="flex items-center gap-1.5 text-xs text-stone-500">
              {Icon && <Icon aria-hidden className="size-3.5" />}
              {label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-stone-900">{value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h4 className="text-sm font-semibold text-stone-900">Description</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{property.description}</p>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-stone-900">Amenities</h4>
        <div className="mt-3 text-sm">
          <AmenityList amenities={property.amenities} />
        </div>
      </section>

      {property.landlord && (
        <section className="rounded-xl border border-stone-200 p-4">
          <h4 className="text-sm font-semibold text-stone-900">Landlord</h4>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={property.landlord.name} src={property.landlord.avatarUrl} />
            <div className="min-w-0">
              <p className="font-medium text-stone-900">{property.landlord.name}</p>
              <p className="truncate text-sm text-stone-500">
                {property.landlord.email} · joined {formatDate(property.landlord.createdAt)}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
