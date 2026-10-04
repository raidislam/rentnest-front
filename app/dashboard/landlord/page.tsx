import type { Metadata } from "next";
import { LandlordOverview } from "@/components/landlord/landlord-overview";
import { getCurrentUser, getLandlordPayments } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Landlord dashboard" };

export default function LandlordDashboardPage() {
  const landlord = getCurrentUser("LANDLORD");
  const totalEarnings = getLandlordPayments(landlord.id)
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <LandlordOverview landlordId={landlord.id} firstName={landlord.name.split(" ")[0]} totalEarnings={totalEarnings} />
  );
}
