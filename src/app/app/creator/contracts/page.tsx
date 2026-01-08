import { createServerSupabaseClient } from "@/lib/supabase/server";
import ContractCard from "@/components/contract-card";
import { requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function CreatorContractsPage() {
  const { user, error } = await requireRole(["creator"], "/app/creator/contracts");
  const supabase = createServerSupabaseClient();

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, title, description, min_value_cents, niche_tags, platforms")
    .eq("status", "live")
    .order("created_at", { ascending: false });

  const { data: savedContracts } = await supabase
    .from("saved_contracts")
    .select("contract_id")
    .eq("creator_user_id", user.id);

  const { data: applications } = await supabase
    .from("applications")
    .select("contract_id, status")
    .eq("creator_user_id", user.id);

  const savedSet = new Set(savedContracts?.map((row) => row.contract_id));
  const applicationMap = new Map(
    applications?.map((row) => [row.contract_id, row.status]) ?? []
  );

  return (
    <main className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl text-ink-900">Live contracts</h1>
        <p className="text-sm text-ink-700">
          Swipe through open briefs and pitch the ones that match your style.
        </p>
      </header>

      {contracts && contracts.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              id={contract.id}
              title={contract.title}
              description={contract.description}
              minValueCents={contract.min_value_cents}
              nicheTags={contract.niche_tags ?? []}
              platforms={contract.platforms ?? []}
              initiallySaved={savedSet.has(contract.id)}
              initialApplicationStatus={applicationMap.get(contract.id) ?? null}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
          No live contracts yet. Check back soon or reach out to brands directly.
        </section>
      )}
    </main>
  );
}
