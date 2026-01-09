import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <Link className="text-sm text-ink-700" href="/">
          ← Back to home
        </Link>
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <h2 className="font-display text-3xl text-ink-900">
              Contracts move faster with a clear login.
            </h2>
            <p className="mt-3 text-sm text-ink-700">
              Log in to keep your negotiations, pitches, and timelines in one
              place.
            </p>
          </div>
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
