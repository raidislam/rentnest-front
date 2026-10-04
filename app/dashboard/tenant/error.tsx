"use client"; // Error boundaries must be Client Components

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function TenantDashboardError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <DashboardError
      {...props}
      homeHref="/dashboard/tenant"
      description="Something went wrong while loading your rental information. Please try again."
    />
  );
}
