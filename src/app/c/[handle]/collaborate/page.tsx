import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import FormSubmitButton from "@/components/form-submit-button";
import { requireRole } from "@/lib/auth/guards";
import { normalizeHandle } from "@/lib/creator-public-profiles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CollaboratePage({
  params,
}: {
  params: { handle: string };
}) {
  const { user, error } = await requireRole(
    ["brand"],
    `/c/${params.handle}/collaborate`
  );

  if (error || !user) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Access issue</h1>
        <p className="text-sm text-red-600">{error ?? "Missing profile."}</p>
      </main>
    );
  }

  const supabase = createServerSupabaseClient();
  const normalized = normalizeHandle(params.handle);
  const { data: creatorProfile } = await supabase
    .from("creator_public_profiles")
    .select("user_id, handle, display_name")
    .eq("handle", normalized)
    .maybeSingle();

  if (!creatorProfile) {
    notFound();
  }

  const creatorUserId = creatorProfile.user_id;
  const creatorHandle = creatorProfile.handle;
  const creatorDisplayName = creatorProfile.display_name;

  const { data: brand } = await supabase
    .from("brands")
    .select("business_name, business_email")
    .eq("user_id", user.id)
    .maybeSingle();

  async function submitRequest(formData: FormData): Promise<void> {
    "use server";

    const budget = String(formData.get("budget_aud") ?? "").trim();
    const deliverables = String(formData.get("deliverables") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      redirect("/login");
    }

    const { error: insertError } = await serverSupabase
      .from("collaboration_requests")
      .insert({
        creator_user_id: creatorUserId,
        brand_user_id: actionUser.id,
        brand_name: brand?.business_name ?? null,
        brand_email: brand?.business_email ?? null,
        budget_aud: budget ? Number(budget) : null,
        deliverables: deliverables || null,
        message: message || null,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    redirect(`/c/${creatorHandle}?request=sent`);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.18),_transparent_55%),linear-gradient(180deg,_#050505_0%,_#0b0b0b_55%,_#050505_100%)]" />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <Link
          href={`/c/${creatorProfile.handle}`}
          className="text-xs uppercase tracking-[0.2em] text-white/60"
        >
          Back to profile
        </Link>
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-3xl text-white">
            Collaborate with {creatorDisplayName}
          </h1>
          <p className="text-sm text-white/70">
            Share your campaign details and we will notify the creator.
          </p>
        </header>

        <form
          action={submitRequest}
          className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-8"
        >
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Budget (AUD)
            <input
              name="budget_aud"
              type="number"
              min="0"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white"
              placeholder="4000"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Deliverables
            <input
              name="deliverables"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white"
              placeholder="3 short-form videos + usage rights"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Message
            <textarea
              name="message"
              rows={4}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white"
              placeholder="Share brand context, timelines, and KPIs."
            />
          </label>
          <FormSubmitButton
            label="Send request"
            loadingLabel="Sending..."
            className="w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
          />
        </form>
      </div>
    </main>
  );
}
