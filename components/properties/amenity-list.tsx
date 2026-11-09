import {
  ArrowUpDown,
  Building2,
  Car,
  Dumbbell,
  Fence,
  ShieldCheck,
  Snowflake,
  Sofa,
  Trees,
  Waves,
  Wifi,
  Zap,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import type { Amenity } from "@/lib/types";

const icons: Record<Amenity, LucideIcon> = {
  "Air conditioning": Snowflake,
  WiFi: Wifi,
  Parking: Car,
  Lift: ArrowUpDown,
  "Generator backup": Zap,
  "24/7 security": ShieldCheck,
  Gym: Dumbbell,
  "Swimming pool": Waves,
  Furnished: Sofa,
  Balcony: Fence,
  Garden: Trees,
  "Rooftop access": Building2,
};

/** Amenity names are free text on the backend, so unknown ones get a generic icon. */
const iconFor = (amenity: string): LucideIcon =>
  icons[amenity as Amenity] ?? (amenity.toLowerCase().replace(/[^a-z]/g, "") === "wifi" ? Wifi : CircleCheck);

export function AmenityList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {amenities.map((amenity) => {
        const Icon = iconFor(amenity);
        return (
          <li key={amenity} className="flex items-center gap-3 text-stone-700">
            <span className="flex size-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Icon aria-hidden className="size-4" />
            </span>
            {amenity}
          </li>
        );
      })}
    </ul>
  );
}
