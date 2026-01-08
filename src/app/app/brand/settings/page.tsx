import BrandSettingsForm from "@/components/brand-settings-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureBrandRow, requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function BrandSettingsPage() {
  const { user, profile, error } = await requireRole(
    ["brand"],
    "/app/brand/settings"
  );

  if (error || !profile) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error ?? "Missing profile."}</p>
      </main>
    );
  }

  const { brand, error: brandError } = await ensureBrandRow(
    { id: user.id, email: user.email },
    profile
  );

  if (brandError || !brand) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{brandError ?? "Missing brand."}</p>
      </main>
    );
  }

  async function saveBrandAction(formData: FormData) {
    "use server";

    const businessName = String(formData.get("business_name") ?? "").trim();
    const businessEmail = String(formData.get("business_email") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim() || "https://example.com";

    if (!businessName || !businessEmail) {
      return { ok: false, message: "Business name and email are required." };
    }

    const supabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await supabase.auth.getUser();

    if (!actionUser) {
      return { ok: false, message: "Please sign in again." };
    }

    const { error: updateError } = await supabase
      .from("brands")
      .update({
        business_name: businessName,
        business_email: businessEmail,
        website,
      })
      .eq("user_id", actionUser.id);

    if (updateError) {
      console.error("Brand settings update failed:", updateError.message);
      return { ok: false, message: updateError.message };
    }

    return { ok: true };
  }

  return (
    <main className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink-900">Settings</h1>
        <p className="text-sm text-ink-700">
          Update your brand profile details.
        </p>
      </header>
      <BrandSettingsForm
        initialBusinessName={brand.business_name}
        initialBusinessEmail={brand.business_email}
        initialWebsite={brand.website}
        saveAction={saveBrandAction}
      />
      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-700">Role</p>
        <p className="mt-2 text-sm text-ink-900">Brand</p>
        <p className="mt-2 text-xs text-ink-700">
          Role switching will be enabled after payouts and contracts are live.
        </p>
      </section>
    </main>
  );
}
