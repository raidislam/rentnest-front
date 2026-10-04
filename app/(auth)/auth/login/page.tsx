import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm, type DemoAccount } from "@/components/auth/login-form";
import { CURRENT_USER_IDS, getUserById } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to manage your rental requests, properties and payments.",
};

export default function LoginPage() {
  const demoAccounts: DemoAccount[] = Object.values(CURRENT_USER_IDS)
    .map((id) => getUserById(id))
    .filter((u) => u !== undefined)
    .map(({ role, name, email }) => ({ role, name, email }));

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-stone-600">
        New to RentNest?{" "}
        <Link href="/auth/register" className="rounded font-medium text-brand-700 hover:text-brand-800">
          Create an account
        </Link>
      </p>
      <div className="mt-8">
        <LoginForm demoAccounts={demoAccounts} />
      </div>
    </>
  );
}
