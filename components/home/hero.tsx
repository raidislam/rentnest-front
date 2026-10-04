import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CreditCard, MapPin, MessageSquare } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { HeroSearch } from "./hero-search";

const highlights = [
  { icon: BadgeCheck, label: "Verified listings" },
  { icon: MessageSquare, label: "Request directly from landlords" },
  { icon: CreditCard, label: "Secure online payments" },
];

interface HeroProps {
  spotlight?: Property;
  locations: string[];
}

export function Hero({ spotlight, locations }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-white">
      <div className="page-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800">
            <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
            Rentals across Dhaka, Chattogram &amp; Sylhet
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl">
            Find &amp; list rental properties <span className="text-brand-700">with ease</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-stone-600">
            Browse homes that match your budget, send a rental request in a minute, and pay securely once your landlord
            approves.
          </p>

          <div className="mt-8">
            <HeroSearch locations={locations} />
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon aria-hidden className="size-4 text-brand-600" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {spotlight && (
          <div className="relative hidden lg:block">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-stone-100">
              <Image
                src={spotlight.images[0]}
                alt={`Exterior of ${spotlight.title}`}
                fill
                preload
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 1px"
                className="object-cover"
              />
            </div>
            <Link
              href={`/properties/${spotlight.id}`}
              className="absolute right-6 bottom-6 left-6 rounded-xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
            >
              <p className="text-xs font-medium tracking-wide text-brand-700 uppercase">Featured listing</p>
              <p className="mt-1 line-clamp-1 font-medium text-stone-900">{spotlight.title}</p>
              <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-1 text-stone-600">
                  <MapPin aria-hidden className="size-4 text-stone-400" />
                  {spotlight.location.area}, {spotlight.location.city}
                </span>
                <span className="font-semibold text-stone-900">
                  {formatPrice(spotlight.price)}
                  <span className="font-normal text-stone-500">/mo</span>
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
