import AppShell from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function CreatorAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, error } = await requireRole(
    ["creator"],
    "/app/creator"
  );

  if (error || !profile) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error ?? "Missing profile."}</p>
      </main>
    );
  }

  return (
    <AppShell
      email={user.email ?? null}
      displayName={profile.display_name ?? null}
      role={profile.role ?? "creator"}
    >
      {children}
    </AppShell>
  );
}
