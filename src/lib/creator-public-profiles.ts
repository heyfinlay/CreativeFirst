import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SupabaseClient = ReturnType<typeof createServerSupabaseClient>;

const HANDLE_FALLBACK = "creator";

export function normalizeHandle(input: string) {
  const trimmed = input.trim().toLowerCase();
  const slug = trimmed.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || HANDLE_FALLBACK;
}

function getEmailPrefix(email?: string | null) {
  if (!email) return "";
  const prefix = email.split("@")[0] ?? "";
  return prefix.trim();
}

async function handleExists(
  supabase: SupabaseClient,
  handle: string,
  userId?: string
) {
  const { data, error } = await supabase
    .from("creator_public_profiles")
    .select("user_id")
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return false;
  if (userId && data.user_id === userId) return false;
  return true;
}

export async function findAvailableHandle(
  supabase: SupabaseClient,
  base: string,
  userId?: string
) {
  const normalized = normalizeHandle(base);
  if (!(await handleExists(supabase, normalized, userId))) {
    return normalized;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.floor(100 + Math.random() * 900);
    const candidate = `${normalized}-${suffix}`;
    if (!(await handleExists(supabase, candidate, userId))) {
      return candidate;
    }
  }

  return `${normalized}-${Date.now().toString().slice(-4)}`;
}

export async function ensureCreatorPublicProfile({
  supabase,
  userId,
  email,
  displayName,
}: {
  supabase?: SupabaseClient;
  userId: string;
  email?: string | null;
  displayName?: string | null;
}) {
  const serverSupabase = supabase ?? createServerSupabaseClient();
  const { data: existing, error } = await serverSupabase
    .from("creator_public_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (existing) {
    return existing;
  }

  const baseName = displayName?.trim() || getEmailPrefix(email) || HANDLE_FALLBACK;
  const handle = await findAvailableHandle(serverSupabase, baseName, userId);
  const resolvedDisplayName = displayName?.trim() || baseName;
  const headline = "Open to brand collaborations.";

  const { data: inserted, error: insertError } = await serverSupabase
    .from("creator_public_profiles")
    .insert({
      user_id: userId,
      handle,
      display_name: resolvedDisplayName,
      headline,
    })
    .select("*")
    .maybeSingle();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return inserted;
}
