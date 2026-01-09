import NavTimingLogger from "@/components/nav-timing-logger";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavTimingLogger />
      {children}
    </>
  );
}
