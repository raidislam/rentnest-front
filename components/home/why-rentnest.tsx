import { BadgeCheck, MessageSquare, ShieldCheck, SlidersHorizontal } from "lucide-react";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Verified listings",
    description: "Every property is reviewed by our team before it goes live, so what you see is what you get.",
  },
  {
    icon: SlidersHorizontal,
    title: "Search that fits",
    description: "Narrow down by area, budget, bedrooms and amenities and see results update instantly.",
  },
  {
    icon: MessageSquare,
    title: "Direct with landlords",
    description: "Send requests straight to property owners and follow each one from pending to active.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    description: "Pay your rent online through trusted gateways like Stripe and SSLCommerz, with a full payment history.",
  },
];

export function WhyRentNest() {
  return (
    <section aria-labelledby="why-rentnest" className="border-y border-stone-200 bg-white">
      <div className="page-container grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold text-brand-700">Why RentNest</p>
          <h2 id="why-rentnest" className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Renting made simple, for both sides of the door
          </h2>
          <p className="mt-3 text-stone-600">
            RentNest brings tenants and landlords onto one transparent platform — from the first search to the monthly
            rent payment.
          </p>
        </div>

        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon aria-hidden className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
