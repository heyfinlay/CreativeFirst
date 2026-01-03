import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

interface ContractPageProps {
  params: { id: string };
}

export default async function ContractDetailPage({ params }: ContractPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function updateApplicationStatus(formData: FormData) {
    "use server";

    const applicationId = String(formData.get("application_id") ?? "");
    const nextStatus = String(formData.get("status") ?? "");
    const allowed = ["approved_to_bid", "rejected"];

    if (!applicationId || !allowed.includes(nextStatus)) {
      return;
    }

    const serverSupabase = createServerSupabaseClient();
    await serverSupabase
      .from("applications")
      .update({ status: nextStatus })
      .eq("id", applicationId);

    revalidatePath(`/brand/contracts/${params.id}`);
  }

  const { data: contract } = await supabase
    .from("contracts")
    .select(
      "id, title, description, status, min_value_cents, deliverable_type, niche_tags, platforms, included_revisions, requires_post_url, shipping_required"
    )
    .eq("id", params.id)
    .eq("brand_user_id", user?.id ?? "")
    .maybeSingle();

  if (!contract) {
    notFound();
  }

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, pitch, status, creator_user_id, profiles ( display_name )"
    )
    .eq("contract_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <Link className="text-sm text-ink-700" href="/brand/contracts">
        ← Back to contracts
      </Link>
      <header className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">
          {contract.status.replace(/_/g, " ")}
        </p>
        <h1 className="font-display text-3xl text-ink-900">{contract.title}</h1>
        <p className="text-sm text-ink-700">{contract.description}</p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
        <div className="grid gap-2 md:grid-cols-2">
          <p>Minimum value: {formatCurrency(contract.min_value_cents)}</p>
          <p>Deliverable: {contract.deliverable_type}</p>
          <p>
            Niche tags: {contract.niche_tags?.length ? contract.niche_tags.join(", ") : "—"}
          </p>
          <p>
            Platforms: {contract.platforms?.length ? contract.platforms.join(", ") : "—"}
          </p>
          <p>Included revisions: {contract.included_revisions}</p>
          <p>Requires post URL: {contract.requires_post_url ? "Yes" : "No"}</p>
          <p>Shipping required: {contract.shipping_required ? "Yes" : "No"}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
        <h2 className="font-display text-xl text-ink-900">Applicants</h2>
        <p className="mt-2 text-sm text-ink-700">
          Review pitches and approve creators to bid.
        </p>
        {applications && applications.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-ink-900/10 bg-white/90 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {app.profiles?.display_name ?? app.creator_user_id}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-700">
                      {app.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <form action={updateApplicationStatus} className="flex gap-2">
                    <input type="hidden" name="application_id" value={app.id} />
                    <button
                      type="submit"
                      name="status"
                      value="approved_to_bid"
                      className="rounded-full border border-ink-900/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900"
                    >
                      Approve to Bid
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="rejected"
                      className="rounded-full border border-ink-900/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900"
                    >
                      Reject
                    </button>
                  </form>
                </div>
                <p className="mt-3 text-sm text-ink-700">{app.pitch}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-700">
            No applicants yet.
          </p>
        )}
      </section>
    </main>
  );
}
