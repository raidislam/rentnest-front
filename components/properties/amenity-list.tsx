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
  type LucideIcon,
} from "lucide-react";
import type { Amenity } from "@/lib/types";

const icons: Record<Amenity, LucideIcon> = {
  "Air conditioning": Snowflake,
  "Wi-Fi": Wifi,
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

export function AmenityList({ amenities }: { amenities: Amenity[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {amenities.map((amenity) => {
        const Icon = icons[amenity];
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
