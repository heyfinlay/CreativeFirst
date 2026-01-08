import AppShell from "@/components/app-shell";
import { ensureBrandRow, requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function BrandAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, error } = await requireRole(["brand"], "/app/brand");

  if (error || !profile) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{error ?? "Missing profile."}</p>
      </main>
    );
  }

  const { error: brandError } = await ensureBrandRow(
    { id: user.id, email: user.email },
    profile
  );

  if (brandError) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl text-ink-900">Account issue</h1>
        <p className="text-sm text-red-600">{brandError}</p>
      </main>
    );
  }

  const navItems = [
    { href: "/app/brand", label: "Home" },
    { href: "/app/brand/contracts", label: "Contracts" },
    { href: "/app/brand/contracts/new", label: "New Contract" },
    { href: "/app/brand/settings", label: "Settings" },
  ];

  return (
    <AppShell
      email={user.email ?? null}
      role={profile.role ?? "brand"}
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
