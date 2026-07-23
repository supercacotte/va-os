"use client";

import { useEffect, useRef, useState } from "react";

import { logout } from "@/lib/actions/auth";

type Props = {
  name: string | null | undefined;
  email: string | null | undefined;
};

export default function UserMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initial = (name?.trim()[0] ?? email?.trim()[0] ?? "?").toUpperCase();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Menu du compte"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-corail font-label text-sm text-paper transition hover:bg-ink"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-line bg-cream p-2 shadow-xl shadow-ink/10">
          <div className="border-b border-line px-3 py-2">
            <p className="truncate font-body text-sm text-ink">{name ?? email}</p>
            {name && email && (
              <p className="truncate font-body text-xs text-muted-2">{email}</p>
            )}
          </div>

          <form action={logout} className="pt-1">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left font-label text-xs uppercase tracking-wide text-ink/80 transition hover:bg-paper hover:text-corail"
            >
              Déconnexion
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
