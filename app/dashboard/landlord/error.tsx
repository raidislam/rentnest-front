"use client"; // Error boundaries must be Client Components

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function LandlordDashboardError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <DashboardError
      {...props}
      homeHref="/dashboard/landlord"
      description="Something went wrong while loading your landlord dashboard. Please try again."
    />
  );
}
