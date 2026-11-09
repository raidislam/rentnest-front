import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getOptionalUser } from "@/lib/auth/session";
import { postLoginPath } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to manage your rental requests, properties and payments.",
};

export default async function LoginPage({ searchParams }: PageProps<"/auth/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  // Already signed in (verified with the backend, so a stale cookie can't cause a redirect loop).
  const user = await getOptionalUser();
  if (user) redirect(postLoginPath(nextPath, user.role));

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
        <LoginForm next={nextPath} />
      </div>
    </>
  );
}
