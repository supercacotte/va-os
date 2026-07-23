"use client";

import { useEffect, useState } from "react";

import { formatClock } from "@/lib/format";

// Timer chrono : un des deux usages autorisés de Bowlby One (DESIGN.md §2).
export default function Chronometer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      suppressHydrationWarning
      className="font-bowlby text-[38px] leading-none tabular-nums text-ink"
    >
      {formatClock(Math.max(0, now - Date.parse(startedAt)))}
    </span>
  );
}
