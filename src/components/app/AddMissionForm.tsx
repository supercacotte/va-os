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
    <form ref={formRef} action={action} className="flex flex-col gap-2">
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
          className="min-w-0 flex-1 rounded-full border border-line bg-cream px-5 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
        />
        <button
          disabled={pending}
          type="submit"
          className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
        >
          {pending ? "Ajout…" : "+ Mission"}
        </button>
      </div>
      {state?.error && <p className="font-body text-xs text-corail">{state.error}</p>}
    </form>
  );
}
