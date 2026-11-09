import type { Metadata } from "next";
import { LandlordOverview } from "@/components/landlord/landlord-overview";
import { getMyReviews, getPropertiesAndRequests } from "@/lib/api/landlord";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Landlord dashboard" };

export default async function LandlordDashboardPage() {
  const session = await requireUser("LANDLORD");
  // GET /api/landlord/properties, /api/landlord/requests and /api/landlord/reviews
  const [{ properties, requests }, reviews] = await Promise.all([getPropertiesAndRequests(), getMyReviews()]);

  return (
    <LandlordOverview firstName={session.name.split(" ")[0]} properties={properties} requests={requests} reviews={reviews} />
  );
}
