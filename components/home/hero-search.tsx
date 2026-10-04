import Form from "next/form";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { PRICE_RANGES, PROPERTY_TYPES } from "@/lib/constants";

/** Submits as GET to /properties?location=…&type=…&price=… with client-side navigation. */
export function HeroSearch({ locations }: { locations: string[] }) {
  return (
    <Form
      action="/properties"
      role="search"
      aria-label="Search rental properties"
      className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5"
    >
      <div className="space-y-1.5 sm:col-span-3">
        <Label htmlFor="hero-location">Location</Label>
        <div className="relative">
          <MapPin aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            id="hero-location"
            name="location"
            list="hero-location-options"
            placeholder="Area or city, e.g. Gulshan"
            autoComplete="off"
            className="h-11 pl-9"
          />
          <datalist id="hero-location-options">
            {locations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero-type">Property type</Label>
        <Select id="hero-type" name="type" defaultValue="" className="h-11">
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero-price">Monthly rent</Label>
        <Select id="hero-price" name="price" defaultValue="" className="h-11">
          <option value="">Any price</option>
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" size="lg" className="h-11 w-full sm:w-auto">
        <Search />
        Search
      </Button>
    </Form>
  );
}
