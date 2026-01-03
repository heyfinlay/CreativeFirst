import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
        <header className="flex flex-col gap-6">
          <p className="font-body text-xs uppercase tracking-[0.4em] text-ink-700">
            Australia-only creator marketplace
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink-900 sm:text-6xl">
            Match with brands that feel like a yes.
          </h1>
          <p className="max-w-2xl text-lg text-ink-700">
            Creative First pairs thoughtful brands with creators who want clarity,
            respect, and fair pay. Post contracts, get matched, and move to escrow
            without the chaos.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              href="/signup"
            >
              Get started
            </Link>
            <Link
              className="rounded-full border border-ink-900/20 bg-white/70 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:-translate-y-0.5"
              href="/login"
            >
              I have an account
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Creator-first rates",
              copy: "No buried fees. Brands see minimums up front, creators set the tone.",
            },
            {
              title: "Real relationship feel",
              copy: "Swipe-like discovery, human briefs, and a clear path to escrow.",
            },
            {
              title: "Built for AU",
              copy: "Local-first matching and terms that make sense for Aussie brands.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-soft"
            >
              <h3 className="font-display text-xl font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-ink-700">{item.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
