import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Profile = {
  role: "creator" | "brand" | "admin";
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

  return { user, profile: profile as Profile };
}

export async function requireUser() {
  const { user } = await getUserAndProfile();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(expectedRole: "creator" | "brand") {
  const { user, profile } = await getUserAndProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile?.role) {
    redirect("/onboarding/role");
  }

  if (profile.role !== expectedRole) {
    if (profile.role === "creator") {
      redirect("/creator");
    }
    if (profile.role === "brand") {
      redirect("/brand");
    }
    redirect("/");
  }

  return { user, profile };
}
