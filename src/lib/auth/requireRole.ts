import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Role = "creator" | "brand" | "admin";

export async function requireRole(expectedRole: "creator" | "brand") {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      role: null,
      display_name: null,
    });

    if (error) {
      console.error("Profile insert failed:", error.message);
      redirect("/login");
    }

    redirect("/onboarding/role");
  }

  if (!profile?.role) {
    redirect("/onboarding/role");
  }

  if (profile.role !== expectedRole && profile.role !== "admin") {
    if (profile.role === "creator") {
      redirect("/creator");
    }
    if (profile.role === "brand") {
      redirect("/brand");
    }
    redirect("/");
  }

  return { user, profile: profile as { role: Role; display_name: string | null } };
}
