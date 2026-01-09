import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <Link className="text-sm text-ink-700" href="/">
          ← Back to home
        </Link>
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <h2 className="font-display text-3xl text-ink-900">
              Start the collaboration you actually want.
            </h2>
            <p className="mt-3 text-sm text-ink-700">
              Join Creative First in minutes and pick your creator or brand
              workspace.
            </p>
          </div>
          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
