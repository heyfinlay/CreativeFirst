import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const navConfig = {
  creator: [
    { href: "/creator", label: "Home" },
    { href: "/creator/contracts", label: "Contracts" },
    { href: "/creator/saved", label: "Saved" },
    { href: "/creator/applications", label: "Applications" },
  ],
  brand: [
    { href: "/brand", label: "Home" },
    { href: "/brand/contracts", label: "Contracts" },
  ],
};

export default async function DashboardNav({
  role,
}: {
  role: "creator" | "brand";
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/60 bg-white/70 px-6 py-4">
      <div className="flex items-center gap-4">
        <Link className="font-display text-lg text-ink-900" href="/">
          Creative First
        </Link>
        <nav className="flex items-center gap-3 text-sm text-ink-700">
          {navConfig[role].map((item) => (
            <Link key={item.href} className="hover:text-ink-900" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-700">
        <span>{user?.email}</span>
        <SignOutButton />
      </div>
    </div>
  );
}
