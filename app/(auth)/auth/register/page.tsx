import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join RentNest as a tenant to find a home, or as a landlord to list your properties.",
};

export default async function RegisterPage({ searchParams }: PageProps<"/auth/register">) {
  const { role } = await searchParams;
  const defaultRole = typeof role === "string" && role.toUpperCase() === "LANDLORD" ? "LANDLORD" : "TENANT";

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-stone-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="rounded font-medium text-brand-700 hover:text-brand-800">
          Log in
        </Link>
      </p>
      <div className="mt-8">
        <RegisterForm defaultRole={defaultRole} />
      </div>
    </>
  );
}
