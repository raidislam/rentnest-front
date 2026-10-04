import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, ChevronRight, Hourglass, House, MapPin, Maximize2, Star } from "lucide-react";
import { AmenityList } from "@/components/properties/amenity-list";
import { BookingPanel } from "@/components/properties/booking-panel";
import { LandlordCard } from "@/components/properties/landlord-card";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { PropertyGrid } from "@/components/properties/property-grid";
import { ReviewList } from "@/components/properties/review-list";
import { Badge } from "@/components/ui/badge";
import {
  getLandlordProperties,
  getPropertyById,
  getPropertyRating,
  getPropertyReviews,
  getSimilarProperties,
  getUserById,
  properties,
} from "@/lib/mock-data";
import { formatDate, propertyTypeLabel } from "@/lib/utils";

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/properties/[id]">): Promise<Metadata> {
  const property = getPropertyById((await params).id);
  if (!property) return { title: "Property not found" };
  const description = property.description.slice(0, 155);
  return {
    title: property.title,
    description,
    openGraph: { title: property.title, description, images: [property.images[0]] },
  };
}

export default async function PropertyDetailsPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  // Future: GET /api/properties/:id
  const property = getPropertyById(id);
  if (!property) notFound();

  const landlord = getUserById(property.landlordId);
  const rating = getPropertyRating(property.id);
  const reviews = getPropertyReviews(property.id).map((r) => ({ ...r, tenant: getUserById(r.tenantId) }));
  const similar = getSimilarProperties(property);
  const similarRatings = Object.fromEntries(similar.map((p) => [p.id, getPropertyRating(p.id)]));
  const listingCount = getLandlordProperties(property.landlordId).filter((p) => p.status === "APPROVED").length;

  const isPendingReview = property.status !== "APPROVED";
  const unavailableReason = isPendingReview
    ? "This listing is awaiting review and can't receive requests yet."
    : !property.isAvailable
      ? "This property is currently rented. Check back later or browse similar homes."
      : undefined;

  const bookingProps = {
    property: { id: property.id, title: property.title, price: property.price },
    landlordName: landlord?.name ?? "the landlord",
    unavailableReason,
  };

  const facts = [
    { icon: House, label: "Type", value: propertyTypeLabel(property.type) },
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Maximize2, label: "Size", value: `${property.areaSqft.toLocaleString("en-IN")} sqft` },
  ];

  return (
    <div className="page-container pt-6 sm:pt-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-500">
          <li>
            <Link href="/properties" className="rounded py-0.5 hover:text-stone-900">
              Properties
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight aria-hidden className="size-4" />
            <Link href={`/properties?location=${encodeURIComponent(property.location.area)}`} className="rounded py-0.5 hover:text-stone-900">
              {property.location.area}
            </Link>
          </li>
          <li className="flex min-w-0 items-center gap-1">
            <ChevronRight aria-hidden className="size-4 shrink-0" />
            <span aria-current="page" className="max-w-64 truncate text-stone-700">
              {property.title}
            </span>
          </li>
        </ol>
      </nav>

      {isPendingReview && (
        <div role="status" className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Hourglass aria-hidden className="size-5 shrink-0" />
          This listing is pending review by the RentNest team and is not visible in search results yet.
        </div>
      )}

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{propertyTypeLabel(property.type)}</Badge>
          {property.isAvailable ? <Badge>Available now</Badge> : <Badge tone="red">Currently rented</Badge>}
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-stone-900 sm:text-3xl">
          {property.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-600">
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden className="size-4 text-stone-400" />
            {property.location.address}, {property.location.area}, {property.location.city}
          </span>
          {rating.count > 0 && (
            <a href="#reviews" className="flex items-center gap-1 rounded hover:text-stone-900">
              <Star aria-hidden className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-stone-900">{rating.average.toFixed(1)}</span>
              <span>
                ({rating.count} {rating.count === 1 ? "review" : "reviews"})
              </span>
            </a>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="min-w-0 space-y-10">
          <PropertyGallery images={property.images} title={property.title} />

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-stone-200 bg-white p-4">
                <dt className="flex items-center gap-2 text-sm text-stone-500">
                  <Icon aria-hidden className="size-4" />
                  {label}
                </dt>
                <dd className="mt-1 font-semibold text-stone-900">{value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="about">
            <h2 id="about" className="text-xl font-semibold">
              About this property
            </h2>
            <p className="mt-3 leading-relaxed text-stone-700">{property.description}</p>
            <p className="mt-3 text-sm text-stone-500">Listed on {formatDate(property.createdAt)}</p>
          </section>

          <section aria-labelledby="amenities">
            <h2 id="amenities" className="text-xl font-semibold">
              Amenities
            </h2>
            <div className="mt-4">
              <AmenityList amenities={property.amenities} />
            </div>
          </section>

          <section aria-labelledby="reviews-heading" id="reviews" className="scroll-mt-24">
            <h2 id="reviews-heading" className="flex items-center gap-2 text-xl font-semibold">
              Reviews
              {rating.count > 0 && (
                <span className="flex items-center gap-1 text-base font-normal text-stone-600">
                  <Star aria-hidden className="size-4 fill-amber-400 text-amber-400" />
                  {rating.average.toFixed(1)} · {rating.count}
                </span>
              )}
            </h2>
            <div className="mt-5">
              <ReviewList reviews={reviews} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Rent this property">
          <BookingPanel {...bookingProps} />
          {landlord && <LandlordCard landlord={landlord} listingCount={listingCount} />}
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-16 border-t border-stone-200 pt-10">
          <h2 id="similar" className="text-xl font-semibold">
            Similar homes in {property.location.city}
          </h2>
          <PropertyGrid properties={similar} ratings={similarRatings} className="mt-6 lg:grid-cols-3" />
        </section>
      )}

      <div className="h-12" />
      <BookingPanel {...bookingProps} variant="bar" />
    </div>
  );
}
