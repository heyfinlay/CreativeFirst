import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export default async function CreatorApplicationsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, status, created_at, contracts ( id, title, description, min_value_cents )"
    )
    .eq("creator_user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl text-ink-900">Applications</h1>
          <p className="text-sm text-ink-700">
            Track the status of your pitches.
          </p>
        </div>
        <Link className="text-sm text-ink-700" href="/creator/contracts">
          Browse live contracts
        </Link>
      </header>

      {applications && applications.length > 0 ? (
        <section className="grid gap-4">
          {applications.map((row) => (
            <article
              key={row.id}
              className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink-900">
                    {row.contracts.title}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-700">
                    {row.status.replace(/_/g, " ")}
                  </p>
                </div>
                <p className="text-xs text-ink-700">
                  Minimum: {formatCurrency(row.contracts.min_value_cents)}
                </p>
              </div>
              <p className="mt-2 text-sm text-ink-700">
                {row.contracts.description}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
          No applications yet. Apply to a live contract to get started.
        </section>
      )}
    </main>
  );
}
