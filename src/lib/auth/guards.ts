import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
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

type AuthedContext = {
  user: { id: string; email?: string | null } | null;
  profile: ProfileRow | null;
  error: string | null;
  supabase: ReturnType<typeof createServerSupabaseClient>;
};

function logGuardTiming({
  name,
  path,
  ms,
  queries,
}: {
  name: string;
  path?: string;
  ms: number;
  queries: number;
}) {
  const route = path ?? "unknown";
  console.log(`[guard] ${name} ${route} ${ms}ms q=${queries}`);
}

export async function getAuthedContext(): Promise<AuthedContext> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null, error: userError?.message ?? null, supabase };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, display_name, instagram_handle, tiktok_handle, youtube_handle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return { user, profile: null, error: profileError.message, supabase };
  }

  return { user, profile: (profile as ProfileRow) ?? null, error: null, supabase };
}

export async function requireUser(
  nextPath: string = "/app"
): Promise<{ user: User }> {
  const start = Date.now();
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  logGuardTiming({
    name: "requireUser",
    path: nextPath,
    ms: Date.now() - start,
    queries: 1,
  });

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return { user };
}

export async function ensureProfile(userId: string, nextPath?: string) {
  const start = Date.now();
  const supabase = createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, display_name, instagram_handle, tiktok_handle, youtube_handle")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logGuardTiming({
      name: "ensureProfile",
      path: nextPath,
      ms: Date.now() - start,
      queries: 1,
    });
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
      logGuardTiming({
        name: "ensureProfile",
        path: nextPath,
        ms: Date.now() - start,
        queries: 2,
      });
      return { profile: null as ProfileRow | null, error: insertError.message };
    }

    logGuardTiming({
      name: "ensureProfile",
      path: nextPath,
      ms: Date.now() - start,
      queries: 2,
    });
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

  logGuardTiming({
    name: "ensureProfile",
    path: nextPath,
    ms: Date.now() - start,
    queries: 1,
  });
  return { profile: profile as ProfileRow, error: null };
}

export async function ensureBrandRow(
  user: { id: string; email?: string | null },
  profile: ProfileRow,
  nextPath?: string
) {
  const start = Date.now();
  const supabase = createServerSupabaseClient();
  const { data: brand, error } = await supabase
    .from("brands")
    .select("user_id, business_name, business_email, website")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    logGuardTiming({
      name: "ensureBrandRow",
      path: nextPath,
      ms: Date.now() - start,
      queries: 1,
    });
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
      logGuardTiming({
        name: "ensureBrandRow",
        path: nextPath,
        ms: Date.now() - start,
        queries: 2,
      });
      return { brand: null as BrandRow | null, error: insertError.message };
    }

    logGuardTiming({
      name: "ensureBrandRow",
      path: nextPath,
      ms: Date.now() - start,
      queries: 2,
    });
    return { brand: insertedBrand as BrandRow, error: null };
  }

  logGuardTiming({
    name: "ensureBrandRow",
    path: nextPath,
    ms: Date.now() - start,
    queries: 1,
  });
  return { brand: brand as BrandRow, error: null };
}

export async function requireRole(
  allowedRoles: Array<"creator" | "brand">,
  nextPath?: string
) {
  const { user, profile, error } = await getAuthedContext();

  if (!user) {
    const nextQuery = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${nextQuery}`);
  }

  if (error) {
    return { user, profile: null as ProfileRow | null, error };
  }

  if (!profile) {
    const nextQuery = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/app/onboarding${nextQuery}&reason=profile`);
  }

  if (!profile.role) {
    const nextQuery = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/app/onboarding${nextQuery}&reason=role`);
  }

  if (profile.role === "admin") {
    return { user, profile: profile as ProfileRow, error: null };
  }

  if (!allowedRoles.includes(profile.role as "creator" | "brand")) {
    redirect("/app");
  }

  return { user, profile: profile as ProfileRow, error: null };
}
