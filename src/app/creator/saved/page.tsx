import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export default async function CreatorSavedPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: saved } = await supabase
    .from("saved_contracts")
    .select(
      "created_at, contracts ( id, title, description, min_value_cents )"
    )
    .eq("creator_user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl text-ink-900">Saved contracts</h1>
          <p className="text-sm text-ink-700">
            Keep track of briefs you want to revisit.
          </p>
        </div>
        <Link className="text-sm text-ink-700" href="/creator/contracts">
          Browse live contracts
        </Link>
      </header>

      {saved && saved.length > 0 ? (
        <section className="grid gap-4">
          {saved.map((row) => (
            <article
              key={row.contracts.id}
              className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft"
            >
              <h2 className="text-lg font-semibold text-ink-900">
                {row.contracts.title}
              </h2>
              <p className="mt-2 text-sm text-ink-700">
                {row.contracts.description}
              </p>
              <p className="mt-3 text-xs text-ink-700">
                Minimum: {formatCurrency(row.contracts.min_value_cents)}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
          No saved contracts yet.
        </section>
      )}
    </main>
  );
}
