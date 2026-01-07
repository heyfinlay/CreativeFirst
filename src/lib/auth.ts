import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Profile = {
  role: "creator" | "brand" | "admin" | null;
  display_name: string | null;
} | null;

export async function getUserAndProfile() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null as Profile };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      user_id: user.id,
      role: null,
      display_name: null,
    });
    return { user, profile: { role: null, display_name: null } };
  }

  return { user, profile: profile as Profile };
}

export async function requireUser() {
  const { user } = await getUserAndProfile();
  if (!user) {
    redirect("/login");
  }
  return user;
}
