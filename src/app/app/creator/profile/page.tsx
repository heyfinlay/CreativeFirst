import CreatorPublicProfileForm from "@/components/creator-public-profile-form";
import { requireRole } from "@/lib/auth/guards";
import {
  ensureCreatorPublicProfile,
  normalizeHandle,
} from "@/lib/creator-public-profiles";
import type { CreatorPublicProfileInput } from "@/lib/creator-public-profile-schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function normalizeTextArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function normalizeObject(value: unknown) {
  return value && typeof value === "object" ? value : {};
}

function normalizeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export default async function CreatorPublicProfilePage() {
  const { user, profile, error } = await requireRole(
    ["creator"],
    "/app/creator/profile"
  );

  if (error || !profile) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error ?? "Missing profile."}</p>
      </main>
    );
  }

  const supabase = createServerSupabaseClient();
  const creatorProfile = await ensureCreatorPublicProfile({
    supabase,
    userId: user.id,
    email: user.email,
    displayName: profile.display_name,
  });

  const initialProfile: CreatorPublicProfileInput = {
    handle: creatorProfile.handle ?? "",
    display_name: creatorProfile.display_name ?? "",
    headline: creatorProfile.headline ?? "",
    bio: creatorProfile.bio ?? "",
    avatar_url: creatorProfile.avatar_url ?? "",
    tags: normalizeTextArray(creatorProfile.tags),
    stats: normalizeObject(creatorProfile.stats) as CreatorPublicProfileInput["stats"],
    platforms: normalizeArray(creatorProfile.platforms) as CreatorPublicProfileInput["platforms"],
    prerequisites: normalizeObject(
      creatorProfile.prerequisites
    ) as CreatorPublicProfileInput["prerequisites"],
    content_style: normalizeTextArray(creatorProfile.content_style),
    audience: normalizeObject(creatorProfile.audience) as CreatorPublicProfileInput["audience"],
    portfolio: normalizeArray(creatorProfile.portfolio) as CreatorPublicProfileInput["portfolio"],
    is_pro: creatorProfile.is_pro ?? false,
  };

  async function checkHandleAvailability(handle: string) {
    "use server";

    const normalized = normalizeHandle(handle);
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      return {
        ok: false,
        available: false,
        handle: normalized,
        message: "Please sign in again.",
      };
    }

    const { data: existing, error: existingError } = await serverSupabase
      .from("creator_public_profiles")
      .select("user_id")
      .eq("handle", normalized)
      .maybeSingle();

    if (existingError) {
      return {
        ok: false,
        available: false,
        handle: normalized,
        message: existingError.message,
      };
    }

    if (!existing || existing.user_id === actionUser.id) {
      return {
        ok: true,
        available: true,
        handle: normalized,
        message: "Handle is available.",
      };
    }

    return {
      ok: true,
      available: false,
      handle: normalized,
      message: "Handle is already taken.",
    };
  }

  async function updateCreatorPublicProfile(
    payload: CreatorPublicProfileInput
  ) {
    "use server";

    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      return { ok: false, message: "Please sign in again." };
    }

    const normalizedHandle = normalizeHandle(payload.handle);
    const displayName = payload.display_name.trim();

    if (!normalizedHandle) {
      return { ok: false, message: "Handle is required." };
    }

    if (!displayName) {
      return { ok: false, message: "Display name is required." };
    }

    const { data: existing, error: existingError } = await serverSupabase
      .from("creator_public_profiles")
      .select("user_id, is_pro")
      .eq("handle", normalizedHandle)
      .maybeSingle();

    if (existingError) {
      return { ok: false, message: existingError.message };
    }

    if (existing && existing.user_id !== actionUser.id) {
      return { ok: false, message: "That handle is already in use." };
    }

    const sanitizedTags = payload.tags.map((tag) => tag.trim()).filter(Boolean);
    const sanitizedContentStyle = payload.content_style
      .map((style) => style.trim())
      .filter(Boolean);
    const sanitizedPlatforms = payload.platforms
      .map((platform) => ({
        platform: platform.platform.trim(),
        handle: platform.handle.trim(),
        followers: platform.followers ?? null,
        verified: Boolean(platform.verified),
      }))
      .filter(
        (platform) =>
          platform.platform || platform.handle || platform.followers !== null
      );
    const sanitizedPortfolio = payload.portfolio
      .map((item) => ({
        platform: item.platform.trim(),
        title: item.title.trim(),
        thumb_url: item.thumb_url.trim(),
        link_url: item.link_url.trim(),
      }))
      .filter(
        (item) => item.title || item.platform || item.thumb_url || item.link_url
      );
    const sanitizedPrerequisites = {
      min_budget_aud: payload.prerequisites.min_budget_aud ?? null,
      paid_only: Boolean(payload.prerequisites.paid_only),
      excluded_categories: payload.prerequisites.excluded_categories
        ?.map((item) => item.trim())
        .filter(Boolean),
    };
    const sanitizedAudience = {
      age_range: payload.audience.age_range?.trim() ?? "",
      gender: payload.audience.gender?.trim() ?? "",
      regions: payload.audience.regions?.map((item) => item.trim()).filter(Boolean),
      note: payload.audience.note?.trim() ?? "",
    };

    const { error: updateError } = await serverSupabase
      .from("creator_public_profiles")
      .update({
        handle: normalizedHandle,
        display_name: displayName,
        headline: payload.headline.trim() || null,
        bio: payload.bio.trim() || null,
        avatar_url: payload.avatar_url.trim() || null,
        tags: sanitizedTags,
        stats: payload.stats ?? {},
        platforms: sanitizedPlatforms,
        prerequisites: sanitizedPrerequisites,
        content_style: sanitizedContentStyle,
        audience: sanitizedAudience,
        portfolio: sanitizedPortfolio,
      })
      .eq("user_id", actionUser.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true };
  }

  return (
    <main className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-ink-900">Public Profile</h1>
        <p className="text-sm text-ink-700">
          Customize the public creator page that brands see.
        </p>
      </header>
      <CreatorPublicProfileForm
        initialProfile={initialProfile}
        saveAction={updateCreatorPublicProfile}
        checkHandleAction={checkHandleAvailability}
      />
    </main>
  );
}
