import { BadgeCheck, Building2, CalendarDays } from "lucide-react";
import { Avatar } from "@/components/shared/avatar";
import type { User } from "@/lib/types";

const memberSince = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** The backend provides only the landlord's id and name, so avatar and join date are optional. */
type LandlordSummary = Pick<User, "name"> & Partial<Pick<User, "avatarUrl" | "createdAt">>;

export function LandlordCard({ landlord, listingCount }: { landlord: LandlordSummary; listingCount: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-stone-500">Listed by</h2>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={landlord.name} src={landlord.avatarUrl} size="lg" />
        <div>
          <p className="flex items-center gap-1.5 font-semibold text-stone-900">
            {landlord.name}
            <BadgeCheck aria-label="Verified landlord" className="size-4 text-brand-600" />
          </p>
          <p className="text-sm text-stone-600">Landlord</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-stone-600">
        {landlord.createdAt && (
          <li className="flex items-center gap-2">
            <CalendarDays aria-hidden className="size-4 text-stone-400" />
            On RentNest since {memberSince(landlord.createdAt)}
          </li>
        )}
        <li className="flex items-center gap-2">
          <Building2 aria-hidden className="size-4 text-stone-400" />
          {listingCount} active {listingCount === 1 ? "listing" : "listings"}
        </li>
      </ul>
      <p className="mt-4 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
        Contact details are shared once your rental request is approved.
      </p>
    </div>
  );
}
