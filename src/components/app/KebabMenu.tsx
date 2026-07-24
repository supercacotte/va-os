"use client";

import { useEffect, useRef, useState } from "react";

// Menu « ··· » (kebab) générique (maquette 33a) : un déclencheur rond et une
// liste d'actions. Se ferme au clic extérieur ou à Échap. Les items sont des
// nœuds fournis par l'appelant (boutons, formulaires…).
export default function KebabMenu({
  label = "Actions",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[18px] font-bold leading-none transition ${
          open ? "bg-ink text-paper" : "text-ink/60 hover:bg-sand hover:text-ink"
        }`}
      >
        ···
      </button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className="absolute right-0 top-9 z-20 flex min-w-[176px] flex-col gap-0.5 rounded-[14px] bg-paper p-1.5 shadow-screen ring-1 ring-ink/10"
        >
          {children}
        </div>
      )}
    </div>
  );
}
