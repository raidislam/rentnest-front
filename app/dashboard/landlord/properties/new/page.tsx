import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/landlord/property-form";
import { PageHeader } from "@/components/shared/page-header";
import { getCategories } from "@/lib/api/landlord";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Add property" };

export default async function NewPropertyPage() {
  await requireUser("LANDLORD");
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/landlord/properties"
        className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        My properties
      </Link>
      <PageHeader title="Add a property" description="Add the details renters need. Your listing appears in search once it's created." />
      <PropertyForm categories={categories} />
    </div>
  );
}
