import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CreatorDashboardPage() {
  return (
    <main className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl text-ink-900">Creator home</h1>
        <p className="text-sm text-ink-700">
          Fresh contracts are waiting. Pick a brief and pitch with confidence.
        </p>
      </header>
      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft">
        <h2 className="font-display text-xl text-ink-900">Next move</h2>
        <p className="mt-2 text-sm text-ink-700">
          Head to the live contract feed to see what brands are posting today.
        </p>
        <Link
          className="mt-4 inline-flex rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
          href="/app/creator/contracts"
        >
          View live contracts
        </Link>
      </section>
    </main>
  );
}
