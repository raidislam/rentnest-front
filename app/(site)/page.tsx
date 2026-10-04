import { FeaturedProperties } from "@/components/home/featured-properties";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { LandlordCta } from "@/components/home/landlord-cta";
import { PopularLocations } from "@/components/home/popular-locations";
import { WhyRentNest } from "@/components/home/why-rentnest";
import {
  getFeaturedProperties,
  getLocationOptions,
  getPopularAreas,
  getPropertyById,
  getPropertyRating,
} from "@/lib/mock-data";

export default function HomePage() {
  const featured = getFeaturedProperties(6);
  const ratings = Object.fromEntries(featured.map((p) => [p.id, getPropertyRating(p.id)]));
  const areas = getPopularAreas();
  const spotlight = getPropertyById("p-1004") ?? featured[0];

  return (
    <>
      <Hero spotlight={spotlight} locations={getLocationOptions()} />
      <PopularLocations areas={areas.slice(0, 8)} />
      <FeaturedProperties properties={featured} ratings={ratings} />
      <HowItWorks />
      <WhyRentNest />
      <LandlordCta image={featured.find((p) => p.type === "VILLA")?.images[1] ?? featured[0].images[0]} />
    </>
  );
}
