"use client";

import { useRef } from "react";
import { useActionState } from "react";

import { createMissionAction } from "@/lib/actions/missions";

export default function AddMissionForm({ clientId }: { clientId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (...args: Parameters<typeof createMissionAction>) => {
      const result = await createMissionAction(...args);
      if (!result?.error) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-2 rounded-[14px] border-2 border-dashed border-ink/30 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="clientId" value={clientId} />
        <label htmlFor={`mission-${clientId}`} className="sr-only">
          Nom de la mission
        </label>
        <input
          id={`mission-${clientId}`}
          name="name"
          required
          placeholder="Nouvelle mission (ex. Gestion des réseaux sociaux)"
          className="min-w-0 flex-1 rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
        />
        <button
          disabled={pending}
          type="submit"
          className="rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Ajout…" : "+ Mission"}
        </button>
      </div>
      {state?.error && <p className="text-xs font-semibold text-ink/70">{state.error}</p>}
    </form>
  );
}
