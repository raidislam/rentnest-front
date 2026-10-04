import { ListPageSkeleton } from "@/components/shared/list-page-skeleton";

export default function AdminRequestsLoading() {
  return <ListPageSkeleton label="Loading requests" chips={6} columns={7} />;
}
