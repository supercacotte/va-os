"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div
      onClick={() => router.back()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-6 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-line bg-cream p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Fermer"
          className="absolute right-5 top-5 text-ink/50 transition hover:text-corail"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
