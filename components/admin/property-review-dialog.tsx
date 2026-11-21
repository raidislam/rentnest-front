"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { AmenityList } from "@/components/properties/amenity-list";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { MappedProperty } from "@/lib/api/mappers";
import { formatDate, formatLocation, formatPrice, propertyTypeLabel } from "@/lib/utils";

/** Read-only property details for admins. No moderation actions: the backend has no moderation endpoint. */
export function PropertyReviewDialog({ property, onClose }: { property: MappedProperty | null; onClose: () => void }) {
  return (
    <Dialog open={!!property} onClose={onClose} title={property?.title ?? "Property"} description={property ? `Listed ${formatDate(property.createdAt)}` : undefined} className="max-w-2xl">
      {property && (
        <div className="space-y-6">
          <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-stone-100">
            <Image src={property.images[0]} alt="" fill sizes="640px" className="object-cover" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={property.isAvailable ? "brand" : "neutral"}>{property.isAvailable ? "Available" : "Unavailable"}</Badge>
            <Badge>{property.category?.name ?? propertyTypeLabel(property.type)}</Badge>
            <span className="text-sm font-semibold text-stone-900">{formatPrice(property.price)}/mo</span>
          </div>
          <p className="flex items-start gap-1.5 text-sm text-stone-600">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-400" />
            {formatLocation(property.location)}
          </p>
          {property.landlord && (
            <section className="flex items-center gap-3 rounded-lg border border-stone-200 p-3">
              <Avatar name={property.landlord.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-900">{property.landlord.name}</p>
                {property.landlord.email && (
                  <a href={`mailto:${property.landlord.email}`} className="flex items-center gap-1 text-xs break-all text-stone-500 hover:text-brand-700">
                    <Mail aria-hidden className="size-3.5" />
                    {property.landlord.email}
                  </a>
                )}
              </div>
            </section>
          )}
          <section>
            <h4 className="text-sm font-semibold text-stone-900">Description</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{property.description}</p>
          </section>
          {property.amenities.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-stone-900">Amenities</h4>
              <div className="mt-3 text-sm">
                <AmenityList amenities={property.amenities} />
              </div>
            </section>
          )}
          {property.isAvailable && (
            <Link href={`/properties/${property.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              View public listing
            </Link>
          )}
        </div>
      )}
    </Dialog>
  );
}
