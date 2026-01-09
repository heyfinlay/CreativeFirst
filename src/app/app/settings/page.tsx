import { redirect } from "next/navigation"
import { getAuthedContext } from "@/lib/auth/guards"

export const dynamic = "force-dynamic"

export default async function AppSettingsPage() {
  const { user, profile } = await getAuthedContext()

  if (!user) {
    redirect("/login?next=/app/settings")
  }

  if (!profile) {
    redirect("/app/onboarding?next=/app/settings&reason=profile")
  }

  if (!profile.role) {
    redirect("/app/onboarding?next=/app/settings&reason=role")
  }

  if (profile.role === "creator") {
    redirect("/app/creator/settings")
  }

  redirect("/app/brand/settings")
}
