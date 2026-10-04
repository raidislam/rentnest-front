"use client"; // Error boundaries must be Client Components

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function AdminDashboardError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <DashboardError
      {...props}
      homeHref="/dashboard/admin"
      description="Something went wrong while loading the admin dashboard. Please try again."
    />
  );
}
