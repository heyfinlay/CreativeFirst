import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import BidCountdown from "@/components/bid-countdown";
import { formatCurrency } from "@/lib/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";

interface ApplicationDetailPageProps {
  params: { id: string };
  searchParams?: { error?: string };
}

export const dynamic = "force-dynamic";

function parseAmountToCents(raw: string) {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned || !/^\d+(\.\d{0,2})?$/.test(cleaned)) {
    return null;
  }

  const [wholePart, fractionalPart = ""] = cleaned.split(".");
  const whole = Number.parseInt(wholePart, 10);
  const fraction = Number.parseInt(
    (fractionalPart + "00").slice(0, 2),
    10
  );

  if (!Number.isFinite(whole) || !Number.isFinite(fraction)) {
    return null;
  }

  const cents = whole * 100 + fraction;
  return cents > 0 ? cents : null;
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  const { user, error } = await requireRole(
    ["creator"],
    `/app/creator/applications/${params.id}`
  );
  const supabase = createServerSupabaseClient();

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  await supabase.rpc("bidding_reject_expired_bids");

  const { data: application } = await supabase
    .from("applications")
    .select(
      "id, status, pitch, created_at, contract:contracts ( id, title, description, min_value_cents )"
    )
    .eq("id", params.id)
    .eq("creator_user_id", user.id)
    .maybeSingle();

  if (!application) {
    notFound();
  }

  const { data: bids } = await supabase
    .from("bids")
    .select("id, amount_cents, message, status, expires_at, created_at")
    .eq("application_id", application.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const bid = bids?.[0] ?? null;
  const bidExpired =
    bid?.status === "expired" ||
    (bid?.expires_at ? new Date(bid.expires_at) < new Date() : false);

  async function submitBid(formData: FormData) {
    "use server";

    const amountInput = String(formData.get("amount") ?? "");
    const message = String(formData.get("message") ?? "").trim();
    const amountCents = parseAmountToCents(amountInput);

    if (!amountCents) {
      redirect(
        `/app/creator/applications/${params.id}?error=${encodeURIComponent(
          "Enter a valid amount."
        )}`
      );
    }

    const serverSupabase = createServerSupabaseClient();
    const { error } = await serverSupabase.rpc("bidding_submit_bid", {
      application_id: params.id,
      amount_cents: amountCents,
      message: message.length ? message : null,
    });

    if (error) {
      console.error("Bid submission failed:", error.message);
      redirect(
        `/app/creator/applications/${params.id}?error=${encodeURIComponent(
          error.message
        )}`
      );
    }

    revalidatePath(`/app/creator/applications/${params.id}`);
  }

  const contract = Array.isArray(application.contract)
    ? application.contract[0]
    : application.contract;

  return (
    <main className="flex w-full flex-col gap-8">
      <Link className="text-sm text-ink-700" href="/app/creator/applications">
        ← Back to applications
      </Link>
      <header className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">
          {application.status.replace(/_/g, " ")}
        </p>
        <h1 className="font-display text-3xl text-ink-900">
          {contract?.title ?? "Contract unavailable"}
        </h1>
        <p className="text-sm text-ink-700">
          {contract?.description ?? "This contract is no longer live."}
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-ink-900">Your bid</h2>
          {contract ? (
            <p className="text-xs text-ink-700">
              Minimum: {formatCurrency(contract.min_value_cents)}
            </p>
          ) : null}
        </div>

        {bid ? (
          <div className="grid gap-2 rounded-2xl border border-ink-900/10 bg-white/90 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink-900">
                {formatCurrency(bid.amount_cents)}
              </p>
              <span className="text-xs uppercase tracking-[0.2em] text-ink-700">
                {bidExpired ? "expired" : bid.status.replace(/_/g, " ")}
              </span>
            </div>
            {bid.message ? (
              <p className="text-sm text-ink-700">{bid.message}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-700">
              <span>
                Expires at{" "}
                {new Date(bid.expires_at).toLocaleString("en-AU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              <BidCountdown expiresAt={bid.expires_at} status={bid.status} />
            </div>
          </div>
        ) : application.status === "approved_to_bid" ? (
          <form action={submitBid} className="grid gap-4">
            {searchParams?.error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {searchParams.error}
              </p>
            ) : null}
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-ink-700">
                Amount (AUD)
              </label>
              <input
                name="amount"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 1200"
                className="w-full rounded-2xl border border-ink-900/10 bg-white/90 px-4 py-3 text-sm text-ink-900"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-ink-700">
                Message (optional)
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full rounded-2xl border border-ink-900/10 bg-white/90 px-4 py-3 text-sm text-ink-900"
                placeholder="Add context for your bid."
              />
            </div>
            <button
              type="submit"
              className="w-fit rounded-full border border-ink-900/20 bg-white px-4 py-2 text-xs font-semibold text-ink-900"
            >
              Submit bid
            </button>
          </form>
        ) : (
          <p className="text-sm text-ink-700">
            You can submit a bid once the brand approves your application.
          </p>
        )}
      </section>
    </main>
  );
}
