import CreatorSettingsForm from "@/components/creator-settings-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function CreatorSettingsPage() {
  const { profile, error } = await requireRole(
    ["creator"],
    "/app/creator/settings"
  );

  if (error || !profile) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error ?? "Missing profile."}</p>
      </main>
    );
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

    const supabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await supabase.auth.getUser();

    if (!actionUser) {
      return { ok: false, message: "Please sign in again." };
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        instagram_handle: instagramHandle || null,
        tiktok_handle: tiktokHandle || null,
        youtube_handle: youtubeHandle || null,
      })
      .eq("user_id", actionUser.id);

    if (updateError) {
      console.error("Creator settings update failed:", updateError.message);
      return { ok: false, message: updateError.message };
    }

    return { ok: true };
  }

  return (
    <main className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink-900">Settings</h1>
        <p className="text-sm text-ink-700">
          Update your creator profile details.
        </p>
      </header>
      <CreatorSettingsForm
        initialDisplayName={profile.display_name ?? ""}
        initialInstagram={profile.instagram_handle ?? ""}
        initialTiktok={profile.tiktok_handle ?? ""}
        initialYoutube={profile.youtube_handle ?? ""}
        saveAction={saveCreatorAction}
      />
      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-ink-700 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-700">Role</p>
        <p className="mt-2 text-sm text-ink-900">Creator</p>
        <p className="mt-2 text-xs text-ink-700">
          Role switching will be enabled after payouts and contracts are live.
        </p>
      </section>
    </main>
  );
}
