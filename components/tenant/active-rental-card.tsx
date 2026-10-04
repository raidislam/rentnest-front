import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { RentalRequestDetails } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { LeaveReviewButton } from "./leave-review-button";
import { tenantRequestPath } from "./request-actions";

export function ActiveRentalCard({ rental }: { rental: RentalRequestDetails }) {
  const { property, landlord } = rental;
  return (
    <article className="grid overflow-hidden rounded-xl border border-stone-200 bg-white sm:grid-cols-[minmax(0,15rem)_1fr]">
      <div className="relative aspect-16/10 bg-stone-100 sm:aspect-auto">
        <Image src={property.images[0]} alt="" fill sizes="(min-width: 640px) 240px, 100vw" className="object-cover" />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={rental.status} />
          <span className="text-sm text-stone-500">Since {formatDate(rental.moveInDate)}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-stone-900">
          <Link href={tenantRequestPath(rental.id)} className="rounded hover:text-brand-700">
            {property.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
          <MapPin aria-hidden className="size-4 text-stone-400" />
          {property.location.address}, {property.location.area}, {property.location.city}
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-stone-500">Monthly rent</dt>
            <dd className="font-semibold text-stone-900">{formatPrice(rental.monthlyRent)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Lease</dt>
            <dd className="flex items-center gap-1.5 font-medium text-stone-900">
              <CalendarDays aria-hidden className="size-4 text-stone-400" />
              {rental.durationMonths} months
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Landlord</dt>
            <dd className="flex items-center gap-2 font-medium text-stone-900">
              <Avatar name={landlord.name} src={landlord.avatarUrl} size="sm" />
              {landlord.name}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={`/properties/${property.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            View property
          </Link>
          {rental.review ? (
            <Badge tone="brand" className="self-start sm:self-center">You reviewed this home</Badge>
          ) : (
            <LeaveReviewButton rentalRequestId={rental.id} propertyId={property.id} propertyTitle={property.title} />
          )}
        </div>
      </div>
    </article>
  );
}
