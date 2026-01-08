import { redirect } from "next/navigation";
import { ensureProfile, requireUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AppEntryPage() {
  const { user } = await requireUser("/app");
  const { profile, error } = await ensureProfile(user.id);

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!profile?.role) {
    redirect("/app/onboarding?next=/app");
  }

  redirect(profile.role === "creator" ? "/app/creator" : "/app/brand");
}
