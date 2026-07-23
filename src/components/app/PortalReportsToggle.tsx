"use client";

import { useOptimistic, useTransition } from "react";

import { togglePortalReportsAction } from "@/lib/actions/reports";

type Props = {
  clientId: string;
  enabled: boolean;
};

// Toggle « Visible sur son portail » (DESIGN-RAPPORTS.md §1) :
// ON = piste citron bordure ink, curseur ink à droite ;
// OFF = piste paper, tout à 33 %, curseur à gauche.
export default function PortalReportsToggle({ clientId, enabled }: Props) {
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(enabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setOptimisticEnabled(!optimisticEnabled);
      const formData = new FormData();
      formData.set("clientId", clientId);
      formData.set("enabled", String(!optimisticEnabled));
      await togglePortalReportsAction(formData);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimisticEnabled}
      disabled={pending}
      onClick={toggle}
      className="flex shrink-0 items-center gap-2.5"
    >
      <span
        className={`text-xs font-bold text-ink ${optimisticEnabled ? "" : "opacity-60"}`}
      >
        Visible sur son portail
      </span>
      <span
        className={`relative h-6 w-11 rounded-full border-2 transition ${
          optimisticEnabled ? "border-ink bg-lime" : "border-ink/30 bg-paper"
        }`}
      >
        <span
          className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full transition-all ${
            optimisticEnabled ? "left-[calc(100%-20px)] bg-ink" : "left-0.5 bg-ink/30"
          }`}
        />
      </span>
    </button>
  );
}
