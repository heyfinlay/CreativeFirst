import { redirect } from "next/navigation";
import RoleSelector from "@/components/role-selector";
import { getUserAndProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RoleOnboardingPage() {
  const { user, profile } = await getUserAndProfile();

  if (!user) {
    redirect("/login");
  }

  if (profile?.role) {
    redirect(profile.role === "creator" ? "/creator" : "/brand");
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <RoleSelector />
      </div>
    </main>
  );
}
