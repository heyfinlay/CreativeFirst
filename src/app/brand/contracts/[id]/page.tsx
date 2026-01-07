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

  async function acceptBid(formData: FormData) {
    "use server";

    const bidId = String(formData.get("bid_id") ?? "");
    if (!bidId) {
      return;
    }

    const serverSupabase = createServerSupabaseClient();
    await serverSupabase.rpc("bidding_accept_bid", { bid_id: bidId });

    revalidatePath(`/brand/contracts/${params.id}`);
  }

  async function rejectBid(formData: FormData) {
    "use server";

    const bidId = String(formData.get("bid_id") ?? "");
    if (!bidId) {
      return;
    }

    const serverSupabase = createServerSupabaseClient();
    await serverSupabase.rpc("bidding_reject_bid", { bid_id: bidId });

    revalidatePath(`/brand/contracts/${params.id}`);
  }

  await supabase.rpc("bidding_reject_expired_bids");

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

  type ApplicationRow = {
    id: string;
    pitch: string | null;
    status: string;
    creator_user_id: string;
    profiles:
      | { display_name: string | null }
      | { display_name: string | null }[]
      | null;
  };

  type BidRow = {
    id: string;
    application_id: string;
    amount_cents: number;
    message: string | null;
    status: string;
    expires_at: string;
    created_at: string;
  };

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, pitch, status, creator_user_id, profiles ( display_name )"
    )
    .eq("contract_id", params.id)
    .order("created_at", { ascending: false });

  const { data: bids } = await supabase
    .from("bids")
    .select("id, application_id, amount_cents, message, status, expires_at, created_at")
    .eq("contract_id", params.id)
    .order("created_at", { ascending: false });

  const typedApplications = applications as ApplicationRow[] | null;
  const typedBids = bids as BidRow[] | null;
  const bidsByApplication = new Map<string, BidRow[]>();

  typedBids?.forEach((bid) => {
    const existing = bidsByApplication.get(bid.application_id) ?? [];
    existing.push(bid);
    bidsByApplication.set(bid.application_id, existing);
  });

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
        {typedApplications && typedApplications.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {typedApplications.map((app) => {
              const displayName = Array.isArray(app.profiles)
                ? app.profiles[0]?.display_name
                : app.profiles?.display_name;
              const appBids = bidsByApplication.get(app.id) ?? [];

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-ink-900/10 bg-white/90 p-4"
                >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {displayName ?? app.creator_user_id}
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
                <div className="mt-4 grid gap-3">
                  {appBids.length > 0 ? (
                    appBids.map((bid) => {
                      const expired =
                        bid.status === "expired" ||
                        new Date(bid.expires_at) < new Date();

                      return (
                        <div
                          key={bid.id}
                          className="rounded-2xl border border-ink-900/10 bg-white/80 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-ink-900">
                              {formatCurrency(bid.amount_cents)}
                            </p>
                            <span className="text-xs uppercase tracking-[0.2em] text-ink-700">
                              {expired ? "expired" : bid.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          {bid.message ? (
                            <p className="mt-2 text-sm text-ink-700">
                              {bid.message}
                            </p>
                          ) : null}
                          <p className="mt-2 text-xs text-ink-700">
                            Expires at{" "}
                            {new Date(bid.expires_at).toLocaleString("en-AU", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {bid.status === "submitted" && !expired ? (
                              <form action={acceptBid}>
                                <input type="hidden" name="bid_id" value={bid.id} />
                                <button
                                  type="submit"
                                  className="rounded-full border border-ink-900/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900"
                                >
                                  Accept
                                </button>
                              </form>
                            ) : null}
                            {bid.status === "submitted" && !expired ? (
                              <form action={rejectBid}>
                                <input type="hidden" name="bid_id" value={bid.id} />
                                <button
                                  type="submit"
                                  className="rounded-full border border-ink-900/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900"
                                >
                                  Reject
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-ink-700">No bids yet.</p>
                  )}
                </div>
                </div>
              );
            })}
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
