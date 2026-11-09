import { connection } from "next/server";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { LandlordCta } from "@/components/home/landlord-cta";
import { PopularLocations } from "@/components/home/popular-locations";
import { WhyRentNest } from "@/components/home/why-rentnest";
import { getPublicServerApi } from "@/lib/api/server";
import { listCategories } from "@/lib/api/services/categories";
import { listProperties } from "@/lib/api/services/properties";
import { placeholderImages } from "@/lib/placeholders";
import { categoryTypeOptions, latestProperties, locationOptions, popularAreas } from "@/lib/property-insights";

export default async function HomePage() {
  // Axios bypasses Next's fetch cache, so render per request instead of once at build time.
  await connection();

  const api = getPublicServerApi();
  const [properties, categories] = await Promise.all([listProperties(api), listCategories(api)]);

  // The backend has no "featured" flag: show the newest available listings.
  const latest = latestProperties(properties, 6);
  const areas = popularAreas(properties);

  return (
    <>
      <Hero spotlight={latest[0]} locations={locationOptions(properties)} typeOptions={categoryTypeOptions(categories)} />
      {areas.length > 0 && <PopularLocations areas={areas.slice(0, 8)} />}
      {/* The list endpoint doesn't include reviews, so cards show no rating. */}
      {latest.length > 0 && <FeaturedProperties properties={latest} ratings={{}} />}
      <HowItWorks />
      <WhyRentNest />
      <LandlordCta image={placeholderImages("landlord-cta")[0]} />
    </>
  );
}
