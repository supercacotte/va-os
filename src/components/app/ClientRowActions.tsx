"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { deleteClientAction } from "@/lib/actions/clients";

type Props = {
  clientId: string;
  name: string;
};

export default function ClientRowActions({ clientId, name }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        aria-label={`Actions pour ${name}`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition hover:bg-cream hover:text-corail"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-44 rounded-2xl border border-line bg-paper p-1.5 shadow-xl shadow-ink/10">
          <Link
            href={`/app/clients/${clientId}`}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-left font-label text-xs uppercase tracking-wide text-ink/80 transition hover:bg-cream hover:text-corail"
          >
            Ouvrir
          </Link>

          <form
            action={deleteClientAction}
            onSubmit={(e) => {
              if (
                !confirm(
                  `Supprimer « ${name} » ? Ses missions, tâches et temps seront supprimés aussi. Cette action est irréversible.`,
                )
              ) {
                e.preventDefault();
                return;
              }
              setOpen(false);
            }}
          >
            <input type="hidden" name="clientId" value={clientId} />
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left font-label text-xs uppercase tracking-wide text-corail/80 transition hover:bg-cream hover:text-corail"
            >
              Supprimer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
