import DashboardNav from "@/components/dashboard-nav";
import { requireRole } from "@/lib/auth";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("creator");

  return (
    <div className="min-h-screen">
      <DashboardNav role="creator" />
      <div className="px-6 py-10">{children}</div>
    </div>
  );
}
