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
        className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/60 text-ink transition hover:bg-paper"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-44 rounded-xl bg-paper p-1.5 shadow-sticker-strong">
          <Link
            href={`/app/clients/${clientId}`}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-sand"
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
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-sand"
            >
              Supprimer…
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
