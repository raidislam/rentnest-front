import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All properties" },
      { href: "/properties?location=Gulshan", label: "Gulshan" },
      { href: "/properties?location=Dhanmondi", label: "Dhanmondi" },
      { href: "/properties?location=Chattogram", label: "Chattogram" },
    ],
  },
  {
    title: "For landlords",
    links: [
      { href: "/auth/register?role=LANDLORD", label: "List your property" },
      { href: "/dashboard/landlord", label: "Landlord dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/login", label: "Log in" },
      { href: "/auth/register", label: "Create an account" },
      { href: "/dashboard/tenant", label: "Tenant dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="page-container grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-stone-600">
            Find and list rental properties with ease. Verified listings, direct requests and secure payments in one place.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold text-stone-900">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="rounded text-sm text-stone-600 hover:text-brand-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-stone-200">
        <div className="page-container flex flex-col gap-2 py-5 text-sm text-stone-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} RentNest. All rights reserved.</p>
          <p>Made for renters and landlords across Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
