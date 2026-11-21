import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getAllCategories } from "@/lib/api/admin";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireUser("ADMIN");
  // Listed via the documented GET /api/categories (there is no admin GET endpoint).
  const categories = await getAllCategories();
  return (
    <div className="space-y-8">
      <PageHeader title="Categories" description="Property categories landlords choose from when listing a property." />
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
