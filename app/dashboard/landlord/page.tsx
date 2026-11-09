import type { Metadata } from "next";
import { LandlordOverview } from "@/components/landlord/landlord-overview";
import { getCurrentUser, getLandlordPayments } from "@/lib/mock-data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Landlord dashboard" };

export default async function LandlordDashboardPage() {
  const session = await requireUser("LANDLORD");
  // Page data is still mock data (wired to the API in a later step); the greeting uses the signed-in user.
  const landlord = getCurrentUser("LANDLORD");
  const totalEarnings = getLandlordPayments(landlord.id)
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <LandlordOverview landlordId={landlord.id} firstName={session.name.split(" ")[0]} totalEarnings={totalEarnings} />
  );
}
