import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";

type NavItem = { href: string; label: string };

type AppShellProps = {
  email: string | null;
  role: "creator" | "brand" | "admin";
  navItems: NavItem[];
  children: React.ReactNode;
};

export default function AppShell({
  email,
  role,
  navItems,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        <aside className="hidden w-64 flex-col gap-6 rounded-3xl border border-ink-900/10 bg-white/80 p-6 shadow-soft lg:flex">
          <div className="flex flex-col gap-2">
            <Link className="font-display text-lg text-ink-900" href="/">
              Creative First
            </Link>
            <span className="text-xs uppercase tracking-[0.2em] text-ink-700">
              {role}
            </span>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-ink-700">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 transition hover:bg-sand-100 hover:text-ink-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 rounded-2xl border border-ink-900/10 bg-sand-50 p-4 text-xs text-ink-700">
            <span className="font-semibold text-ink-900">Signed in</span>
            <span>{email ?? "—"}</span>
            <SignOutButton />
          </div>
        </aside>
        <div className="flex flex-1 flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink-900/10 bg-white/80 px-6 py-4 shadow-soft lg:hidden">
            <div className="flex flex-col">
              <Link className="font-display text-lg text-ink-900" href="/">
                Creative First
              </Link>
              <span className="text-xs uppercase tracking-[0.2em] text-ink-700">
                {role}
              </span>
            </div>
            <div className="flex flex-col items-end gap-2 text-xs text-ink-700">
              <span>{email ?? "—"}</span>
              <SignOutButton />
            </div>
            <nav className="flex w-full flex-wrap gap-2 text-xs text-ink-700">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-ink-900/10 bg-white px-3 py-1.5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
