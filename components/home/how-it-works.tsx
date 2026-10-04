import { KeyRound, Search, Send } from "lucide-react";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    icon: Search,
    title: "Search & shortlist",
    description: "Filter by location, budget, property type and amenities to find homes that fit your life.",
  },
  {
    icon: Send,
    title: "Request to rent",
    description: "Pick your move-in date and send a request with a note to the landlord. Track its status anytime.",
  },
  {
    icon: KeyRound,
    title: "Pay & move in",
    description: "Once approved, pay securely online and your rental becomes active. Then leave a review.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="page-container py-16 sm:py-20">
      <SectionHeading
        id="how-it-works"
        eyebrow="How it works"
        title="Rent your next home in three steps"
      />

      <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
        {steps.map(({ icon: Icon, title, description }, i) => (
          <li key={title} className="relative">
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute top-6 left-14 hidden h-px w-[calc(100%-3.5rem)] bg-stone-200 md:block" />
            )}
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Icon aria-hidden className="size-5" />
            </div>
            <p className="mt-5 text-sm font-medium text-stone-500">Step {i + 1}</p>
            <h3 className="mt-1 text-lg font-semibold text-stone-900">{title}</h3>
            <p className="mt-2 text-stone-600">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
