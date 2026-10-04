import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { buttonVariants } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { SectionHeading } from "./section-heading";

interface FeaturedPropertiesProps {
  properties: Property[];
  ratings: Record<string, { average: number; count: number }>;
}

export function FeaturedProperties({ properties, ratings }: FeaturedPropertiesProps) {
  return (
    <section aria-labelledby="featured-properties" className="border-y border-stone-200 bg-white">
      <div className="page-container py-16 sm:py-20">
        <SectionHeading
          id="featured-properties"
          eyebrow="Featured properties"
          title="Handpicked homes available now"
          description="Verified listings with clear pricing and responsive landlords."
          action={
            <Link href="/properties" className={buttonVariants({ variant: "outline" })}>
              View all properties
              <ArrowRight />
            </Link>
          }
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} rating={ratings[property.id]} />
          ))}
        </div>
      </div>
    </section>
  );
}
