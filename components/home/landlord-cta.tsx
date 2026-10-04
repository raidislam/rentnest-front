import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const benefits = [
  "Create a listing with photos, pricing and amenities",
  "Review tenant requests and approve with one click",
  "Track payments and earnings from your dashboard",
];

export function LandlordCta({ image }: { image: string }) {
  return (
    <section aria-labelledby="landlord-cta" className="page-container py-16 sm:py-20">
      <div className="grid overflow-hidden rounded-2xl bg-brand-900 lg:grid-cols-2">
        <div className="p-8 sm:p-12">
          <p className="text-sm font-semibold text-brand-300">For landlords</p>
          <h2 id="landlord-cta" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Own a property? List it on RentNest
          </h2>
          <p className="mt-3 text-brand-100/90">
            Reach renters who are actively looking, and manage every request and payment in one place.
          </p>

          <ul className="mt-6 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-white">
                <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-300" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register?role=LANDLORD" className={buttonVariants({ variant: "inverse", size: "lg" })}>
              List your property
              <ArrowRight />
            </Link>
            <Link
              href="/auth/login"
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className: "text-white hover:bg-white/10 hover:text-white",
              })}
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-80 lg:block">
          <Image src={image} alt="" fill sizes="(min-width: 1024px) 50vw, 0px" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
