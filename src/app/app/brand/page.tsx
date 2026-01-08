import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BrandDashboardPage() {
  return (
    <main className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl text-ink-900">Brand home</h1>
        <p className="text-sm text-ink-700">
          Start a contract and find creators who match your voice.
        </p>
      </header>
      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft">
        <h2 className="font-display text-xl text-ink-900">
          Create your next brief
        </h2>
        <p className="mt-2 text-sm text-ink-700">
          Draft the essentials and publish when you are ready to invite creators.
        </p>
        <Link
          className="mt-4 inline-flex rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
          href="/app/brand/contracts/new"
        >
          Start a contract
        </Link>
      </section>
    </main>
  );
}
