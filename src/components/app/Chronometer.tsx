"use client";

import { useEffect, useState } from "react";

import { formatClock } from "@/lib/format";

export default function Chronometer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span suppressHydrationWarning className="font-label text-3xl tabular-nums text-ink">
      {formatClock(Math.max(0, now - Date.parse(startedAt)))}
    </span>
  );
}
