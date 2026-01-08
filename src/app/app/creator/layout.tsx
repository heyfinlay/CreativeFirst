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

  const navItems = [
    { href: "/app/creator", label: "Home" },
    { href: "/app/creator/contracts", label: "Browse Contracts" },
    { href: "/app/creator/saved", label: "Saved" },
    { href: "/app/creator/applications", label: "Applications" },
    { href: "/app/creator/profile", label: "Public Profile" },
    { href: "/app/creator/settings", label: "Settings" },
  ];

  return (
    <AppShell
      email={user.email ?? null}
      role={profile.role ?? "creator"}
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
