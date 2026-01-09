"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavTimingLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    const query = searchParams?.toString();
    const currentPath = query ? `${pathname}?${query}` : pathname;
    const now = performance.now();

    if (lastPathRef.current && lastTimestampRef.current !== null) {
      const elapsed = Math.round(now - lastTimestampRef.current);
      console.log(`NAV ${lastPathRef.current} -> ${currentPath} took ${elapsed}ms`);
    }

    lastPathRef.current = currentPath;
    lastTimestampRef.current = now;
  }, [pathname, searchParams]);

  return null;
}
