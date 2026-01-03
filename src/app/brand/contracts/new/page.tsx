import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default function NewContractPage() {
  async function createContract(formData: FormData) {
    "use server";

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const deliverableType = String(formData.get("deliverable_type") ?? "").trim();
    const minValueCents = Number(formData.get("min_value_cents") ?? 10000);
    const status = String(formData.get("status") ?? "draft");
    const nicheTagsRaw = String(formData.get("niche_tags") ?? "");
    const platformsRaw = String(formData.get("platforms") ?? "");
    const includedRevisions = Number(formData.get("included_revisions") ?? 0);
    const requiresPostUrl = formData.get("requires_post_url") === "on";
    const shippingRequired = formData.get("shipping_required") === "on";

    const nicheTags = nicheTagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const platforms = platformsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const allowedStatuses = ["draft", "live", "live_requires_payment"];
    const normalizedStatus = allowedStatuses.includes(status)
      ? status
      : "draft";

    await supabase.from("contracts").insert({
      brand_user_id: user.id,
      title,
      description,
      deliverable_type: deliverableType || "unspecified",
      min_value_cents: Math.max(minValueCents, 10000),
      status: normalizedStatus,
      niche_tags: nicheTags,
      platforms,
      included_revisions: includedRevisions,
      requires_post_url: requiresPostUrl,
      shipping_required: shippingRequired,
    });

    revalidatePath("/brand/contracts");
    redirect("/brand/contracts");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl text-ink-900">New contract</h1>
        <p className="text-sm text-ink-700">
          Draft the essentials and publish when you are ready.
        </p>
      </header>

      <form
        action={createContract}
        className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft"
      >
        <label className="flex flex-col gap-2 text-sm text-ink-700">
          Title
          <input
            name="title"
            required
            className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ink-700">
          Description
          <textarea
            name="description"
            required
            rows={5}
            className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Minimum value (AUD cents)
            <input
              name="min_value_cents"
              type="number"
              min={10000}
              defaultValue={10000}
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Deliverable type
            <input
              name="deliverable_type"
              placeholder="Reel, TikTok, UGC, etc"
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Niche tags (comma separated)
            <input
              name="niche_tags"
              placeholder="beauty, wellness"
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Platforms (comma separated)
            <input
              name="platforms"
              placeholder="Instagram, TikTok"
              className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm text-ink-700">
          Included revisions
          <input
            name="included_revisions"
            type="number"
            min={0}
            defaultValue={0}
            className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
          />
        </label>
        <div className="flex flex-wrap gap-4 text-sm text-ink-700">
          <label className="flex items-center gap-2">
            <input name="requires_post_url" type="checkbox" />
            Requires post URL
          </label>
          <label className="flex items-center gap-2">
            <input name="shipping_required" type="checkbox" />
            Shipping required
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm text-ink-700">
          Status
          <select
            name="status"
            className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900"
          >
            <option value="draft">Save as draft</option>
            <option value="live">Publish live (dev bypass)</option>
            <option value="live_requires_payment">Publish (requires payment)</option>
          </select>
        </label>
        <p className="text-xs text-ink-700">
          TODO: posting fee and payment gate (Stripe) should move live contracts
          into a \"live_requires_payment\" hold until paid.
        </p>
        <button
          type="submit"
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft"
        >
          Save contract
        </button>
      </form>
    </main>
  );
}
