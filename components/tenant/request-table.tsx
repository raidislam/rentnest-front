import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import type { RentalRequestDetails } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { RequestActions, tenantRequestPath } from "./request-actions";

function PropertyCell({ request, wrap = false }: { request: RentalRequestDetails; wrap?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        <Image src={request.property.images[0]} alt="" fill sizes="48px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <Link
          href={tenantRequestPath(request.id)}
          className={`${wrap ? "line-clamp-2" : "line-clamp-1"} rounded font-medium text-stone-900 hover:text-brand-700`}
        >
          {request.property.title}
        </Link>
        <p className="truncate text-sm text-stone-500">
          {request.property.location.area}, {request.property.location.city} · {request.landlord.name}
        </p>
      </div>
    </div>
  );
}

/** Tenant rental requests: a table on desktop, stacked cards on small screens. */
export function RequestTable({ requests }: { requests: RentalRequestDetails[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white xl:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs font-medium tracking-wide text-stone-500 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Property</th>
              <th scope="col" className="px-4 py-3">Requested</th>
              <th scope="col" className="px-4 py-3">Move-in</th>
              <th scope="col" className="px-4 py-3 text-right">Rent</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-stone-50/60">
                <td className="w-full max-w-0 px-4 py-3">
                  <PropertyCell request={request} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-stone-600">{formatDate(request.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-stone-600">{formatDate(request.moveInDate)}</td>
                <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-stone-900">
                  {formatPrice(request.monthlyRent)}
                  <span className="font-normal text-stone-500">/mo</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <RequestActions request={request} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
        {requests.map((request) => (
          <li key={request.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <StatusBadge status={request.status} />
            <div className="mt-3">
              <PropertyCell request={request} wrap />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-stone-500">Requested</dt>
                <dd className="font-medium text-stone-900">{formatDate(request.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Move-in</dt>
                <dd className="font-medium text-stone-900">{formatDate(request.moveInDate)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Rent</dt>
                <dd className="font-medium text-stone-900">{formatPrice(request.monthlyRent)}</dd>
              </div>
            </dl>
            <RequestActions request={request} className="mt-4 w-full" />
          </li>
        ))}
      </ul>
    </>
  );
}
