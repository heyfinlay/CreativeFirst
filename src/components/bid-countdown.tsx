"use client";

import { useEffect, useMemo, useState } from "react";

type BidCountdownProps = {
  expiresAt: string;
  status: string;
};

function formatRemaining(msRemaining: number) {
  if (msRemaining <= 0) {
    return "Expired";
  }

  const totalMinutes = Math.floor(msRemaining / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `Expires in ${hours}h ${minutes}m`;
}

export default function BidCountdown({ expiresAt, status }: BidCountdownProps) {
  const expiresTime = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (status !== "submitted") {
    return null;
  }

  return (
    <span className="text-xs text-ink-700">
      {formatRemaining(expiresTime - now)}
    </span>
  );
}
