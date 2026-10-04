import { ListPageSkeleton } from "@/components/shared/list-page-skeleton";

export default function AdminPropertiesLoading() {
  return <ListPageSkeleton label="Loading properties" columns={6} />;
}
