import DashboardNav from "@/components/dashboard-nav";
import { requireRole } from "@/lib/auth/requireRole";

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("brand");

  return (
    <div className="min-h-screen">
      <DashboardNav role="brand" />
      <div className="px-6 py-10">{children}</div>
    </div>
  );
}
