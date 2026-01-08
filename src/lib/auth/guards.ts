import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Role = "creator" | "brand" | "admin";

type ProfileRow = {
  role: Role | null;
  display_name: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  youtube_handle?: string | null;
};

type BrandRow = {
  user_id: string;
  business_name: string;
  business_email: string;
  website: string;
};

export async function requireUser(nextPath?: string) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const nextQuery = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${nextQuery}`);
  }

  return { user, supabase };
}

export async function ensureProfile(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, display_name, instagram_handle, tiktok_handle, youtube_handle")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { profile: null as ProfileRow | null, error: error.message };
  }

  if (!profile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: userId,
      role: null,
      display_name: null,
      instagram_handle: null,
      tiktok_handle: null,
      youtube_handle: null,
    });

    if (insertError) {
      return { profile: null as ProfileRow | null, error: insertError.message };
    }

    return {
      profile: {
        role: null,
        display_name: null,
        instagram_handle: null,
        tiktok_handle: null,
        youtube_handle: null,
      },
      error: null,
    };
  }

  return { profile: profile as ProfileRow, error: null };
}

export async function ensureBrandRow(user: { id: string; email?: string | null }, profile: ProfileRow) {
  const supabase = createServerSupabaseClient();
  const { data: brand, error } = await supabase
    .from("brands")
    .select("user_id, business_name, business_email, website")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { brand: null as BrandRow | null, error: error.message };
  }

  if (!brand) {
    const email = user.email ?? "unknown@example.com";
    const fallbackName = profile.display_name || email.split("@")[0] || "Brand";

    const { data: insertedBrand, error: insertError } = await supabase
      .from("brands")
      .insert({
        user_id: user.id,
        business_name: fallbackName,
        business_email: email,
        website: "https://example.com",
      })
      .select("user_id, business_name, business_email, website")
      .maybeSingle();

    if (insertError) {
      return { brand: null as BrandRow | null, error: insertError.message };
    }

    return { brand: insertedBrand as BrandRow, error: null };
  }

  return { brand: brand as BrandRow, error: null };
}

export async function requireRole(
  allowedRoles: Array<"creator" | "brand">,
  nextPath?: string
) {
  const { user } = await requireUser(nextPath);
  const { profile, error } = await ensureProfile(user.id);

  if (error) {
    return { user, profile: null as ProfileRow | null, error };
  }

  if (!profile?.role) {
    const nextQuery = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/app/onboarding${nextQuery}`);
  }

  if (profile.role === "admin") {
    return { user, profile: profile as ProfileRow, error: null };
  }

  if (!allowedRoles.includes(profile.role as "creator" | "brand")) {
    redirect("/app");
  }

  return { user, profile: profile as ProfileRow, error: null };
}
