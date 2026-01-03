import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export default async function BrandContractsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, title, status, min_value_cents, created_at")
    .eq("brand_user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl text-ink-900">Your contracts</h1>
          <p className="text-sm text-ink-700">
            Keep drafts moving or publish a new brief.
          </p>
        </div>
        <Link
          className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
          href="/brand/contracts/new"
        >
          New contract
        </Link>
      </header>

      {contracts && contracts.length > 0 ? (
        <section className="grid gap-4">
          {contracts.map((contract) => (
            <Link
              key={contract.id}
              href={`/brand/contracts/${contract.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/60 bg-white/80 px-6 py-4 text-sm text-ink-700 shadow-soft"
            >
              <div>
                <p className="text-lg font-semibold text-ink-900">
                  {contract.title}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-700">
                  {contract.status.replace(/_/g, " ")}
                </p>
              </div>
              <p className="text-sm text-ink-900">
                {formatCurrency(contract.min_value_cents)} minimum
              </p>
            </Link>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
          No contracts yet. Start with a draft to invite creators.
        </section>
      )}
    </main>
  );
}
