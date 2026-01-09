import { redirect } from "next/navigation";
import { getAuthedContext } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AppEntryPage() {
  const { user, profile, error } = await getAuthedContext();

  if (!user) {
    redirect("/login?next=/app");
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!profile) {
    redirect("/app/onboarding?next=/app&reason=profile");
  }

  if (!profile.role) {
    redirect("/app/onboarding?next=/app&reason=role");
  }

  redirect(profile.role === "creator" ? "/app/creator" : "/app/brand");
}
