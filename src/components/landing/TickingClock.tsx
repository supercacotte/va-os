"use client";

import { useEffect, useState } from "react";

// Chrono de démonstration qui tourne vraiment (mockups de la landing).
export default function TickingClock({ start = "01:23:47" }: { start?: string }) {
  const [h, m, s] = start.split(":").map(Number);
  const [seconds, setSeconds] = useState(h * 3600 + m * 60 + s);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span suppressHydrationWarning>
      {pad(Math.floor(seconds / 3600))}:{pad(Math.floor((seconds % 3600) / 60))}:
      {pad(seconds % 60)}
    </span>
  );
}
