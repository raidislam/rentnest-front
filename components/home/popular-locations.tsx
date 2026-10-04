import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./section-heading";

interface Area {
  area: string;
  city: string;
  count: number;
  image: string;
}

export function PopularLocations({ areas }: { areas: Area[] }) {
  return (
    <section aria-labelledby="popular-locations" className="page-container py-16 sm:py-20">
      <SectionHeading
        id="popular-locations"
        eyebrow="Popular locations"
        title="Explore neighbourhoods renters love"
        description="Jump straight into listings in the most searched areas."
      />

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {areas.map(({ area, city, count, image }) => (
          <li key={area}>
            <Link
              href={`/properties?location=${encodeURIComponent(area)}`}
              className="group relative block aspect-4/3 overflow-hidden rounded-xl bg-stone-200"
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                <p className="font-semibold">{area}</p>
                <p className="text-sm text-white/80">
                  {city} · {count} {count === 1 ? "listing" : "listings"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
