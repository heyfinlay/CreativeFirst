import OnboardingForm from "@/components/onboarding-form";
import {
  ensureBrandRow,
  ensureProfile,
  requireUser,
} from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppOnboardingPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const { user } = await requireUser("/app/onboarding");
  const { profile, error } = await ensureProfile(user.id);

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("business_name, business_email, website")
    .eq("user_id", user.id)
    .maybeSingle();

  async function setRoleAction(formData: FormData) {
    "use server";

    const role = String(formData.get("role") ?? "");
    if (role !== "creator" && role !== "brand") {
      return { ok: false, message: "Choose a valid role." };
    }

    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      return { ok: false, message: "Please sign in again." };
    }

    const { error: updateError } = await serverSupabase
      .from("profiles")
      .update({ role })
      .eq("user_id", actionUser.id);

    if (updateError) {
      console.error("Role update failed:", updateError.message);
      return { ok: false, message: updateError.message };
    }

    if (role === "brand") {
      const { profile: latestProfile, error: profileError } =
        await ensureProfile(actionUser.id);
      if (profileError || !latestProfile) {
        return { ok: false, message: profileError ?? "Profile error." };
      }
      const { error: brandError } = await ensureBrandRow(
        { id: actionUser.id, email: actionUser.email },
        latestProfile
      );
      if (brandError) {
        return { ok: false, message: brandError };
      }
    }

    return { ok: true, role: role as "creator" | "brand" };
  }

  async function saveBrandAction(formData: FormData) {
    "use server";

    const businessName = String(formData.get("business_name") ?? "").trim();
    const businessEmail = String(formData.get("business_email") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim() || "https://example.com";

    if (!businessName || !businessEmail) {
      return { ok: false, message: "Business name and email are required." };
    }

    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      return { ok: false, message: "Please sign in again." };
    }

    const { error: updateError } = await serverSupabase
      .from("brands")
      .upsert(
        {
          user_id: actionUser.id,
          business_name: businessName,
          business_email: businessEmail,
          website,
        },
        { onConflict: "user_id" }
      );

    if (updateError) {
      console.error("Brand update failed:", updateError.message);
      return { ok: false, message: updateError.message };
    }

    return { ok: true };
  }

  async function saveCreatorAction(formData: FormData) {
    "use server";

    const displayName = String(formData.get("display_name") ?? "").trim();
    const instagramHandle = String(formData.get("instagram_handle") ?? "").trim();
    const tiktokHandle = String(formData.get("tiktok_handle") ?? "").trim();
    const youtubeHandle = String(formData.get("youtube_handle") ?? "").trim();

    if (!displayName) {
      return { ok: false, message: "Display name is required." };
    }

    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      return { ok: false, message: "Please sign in again." };
    }

    const { error: updateError } = await serverSupabase
      .from("profiles")
      .update({
        display_name: displayName,
        instagram_handle: instagramHandle || null,
        tiktok_handle: tiktokHandle || null,
        youtube_handle: youtubeHandle || null,
      })
      .eq("user_id", actionUser.id);

    if (updateError) {
      console.error("Creator profile update failed:", updateError.message);
      return { ok: false, message: updateError.message };
    }

    return { ok: true };
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <OnboardingForm
          initialProfile={profile ?? { role: null, display_name: null }}
          initialBrand={brand ?? null}
          nextPath={searchParams?.next ?? null}
          setRoleAction={setRoleAction}
          saveBrandAction={saveBrandAction}
          saveCreatorAction={saveCreatorAction}
        />
      </div>
    </main>
  );
}
