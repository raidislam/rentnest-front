import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CreditCard, MessageSquare } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { getPropertyById } from "@/lib/mock-data";

const points = [
  { icon: BadgeCheck, text: "Verified listings across Dhaka, Chattogram and Sylhet" },
  { icon: MessageSquare, text: "Send rental requests and track every status" },
  { icon: CreditCard, text: "Pay rent securely once your request is approved" },
];

// Focused split-screen layout for /auth/* pages (no marketing navbar or footer).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const image = getPropertyById("p-1006")?.images[1];

  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <div className="flex flex-col bg-white">
        <header className="flex items-center justify-between px-4 py-5 sm:px-8">
          <Logo />
          <Link href="/" className="flex items-center gap-1.5 rounded text-sm font-medium text-stone-600 hover:text-stone-900">
            <ArrowLeft aria-hidden className="size-4" />
            Back to home
          </Link>
        </header>
        <main id="main" className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="px-4 py-5 text-center text-xs text-stone-500 sm:px-8">
          © {new Date().getFullYear()} RentNest. All rights reserved.
        </footer>
      </div>

      <aside aria-hidden className="relative hidden overflow-hidden bg-brand-900 lg:block">
        {image && <Image src={image} alt="" fill sizes="50vw" className="object-cover opacity-40" />}
        <div className="absolute inset-0 bg-linear-to-t from-brand-950 via-brand-950/60 to-brand-900/20" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-md text-3xl font-semibold tracking-tight text-balance">
            Your next home is a few clicks away.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-50">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
