import Image from "next/image";
import Link from "next/link";
import { House, MapPin } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { MappedRentalRequest } from "@/lib/api/mappers";
import { formatLocation, formatPrice } from "@/lib/utils";
import { tenantRequestPath } from "./request-actions";

/** The tenant's current (ACTIVE) rental. Shows only details the backend provides. */
export function ActiveRentalCard({ rental }: { rental: MappedRentalRequest }) {
  const { property } = rental;
  const landlord = property?.landlord;
  return (
    <article className="grid overflow-hidden rounded-xl border border-stone-200 bg-white sm:grid-cols-[minmax(0,15rem)_1fr]">
      <div className="relative flex aspect-16/10 items-center justify-center bg-stone-100 text-stone-400 sm:aspect-auto">
        {property ? (
          <Image src={property.images[0]} alt="" fill sizes="(min-width: 640px) 240px, 100vw" className="object-cover" />
        ) : (
          <House aria-hidden className="size-8" />
        )}
      </div>
      <div className="p-5">
        <StatusBadge status={rental.status} />
        <h3 className="mt-2 text-lg font-semibold text-stone-900">
          <Link href={tenantRequestPath(rental.id)} className="rounded hover:text-brand-700">
            {property?.title ?? "Property unavailable"}
          </Link>
        </h3>
        {property && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
            <MapPin aria-hidden className="size-4 text-stone-400" />
            {formatLocation(property.location)}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {rental.monthlyRent !== undefined && (
            <div>
              <dt className="text-stone-500">Monthly rent</dt>
              <dd className="font-semibold text-stone-900">{formatPrice(rental.monthlyRent)}</dd>
            </div>
          )}
          {landlord && (
            <div>
              <dt className="text-stone-500">Landlord</dt>
              <dd className="flex items-center gap-2 font-medium text-stone-900">
                <Avatar name={landlord.name} size="sm" />
                {landlord.name}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={tenantRequestPath(rental.id)} className={buttonVariants({ variant: "outline", size: "sm" })}>
            View rental
          </Link>
          {property && (
            <Link href={`/properties/${property.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View property
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
