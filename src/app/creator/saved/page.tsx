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
      "created_at, contract:contracts ( id, title, description, min_value_cents )"
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
          {saved.map((row) => {
            const contract = Array.isArray(row.contract)
              ? row.contract[0]
              : row.contract;

            return (
              <article
                key={contract?.id ?? row.created_at}
                className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft"
              >
                <h2 className="text-lg font-semibold text-ink-900">
                  {contract?.title ?? "Contract unavailable"}
                </h2>
                <p className="mt-2 text-sm text-ink-700">
                  {contract?.description ?? "This contract is no longer live."}
                </p>
                <p className="mt-3 text-xs text-ink-700">
                  Minimum:{" "}
                  {contract ? formatCurrency(contract.min_value_cents) : "—"}
                </p>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
          No saved contracts yet.
        </section>
      )}
    </main>
  );
}
