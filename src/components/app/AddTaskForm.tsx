"use client";

import { useRef } from "react";
import { useActionState } from "react";

import { createTaskAction } from "@/lib/actions/tasks";

type Props = {
  missionId: string;
  clientId: string;
};

export default function AddTaskForm({ missionId, clientId }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (...args: Parameters<typeof createTaskAction>) => {
      const result = await createTaskAction(...args);
      if (!result?.error) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <form ref={formRef} action={action} className="mt-2 flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="missionId" value={missionId} />
        <input type="hidden" name="clientId" value={clientId} />
        <label htmlFor={`task-${missionId}`} className="sr-only">
          Nouvelle tâche
        </label>
        <input
          id={`task-${missionId}`}
          name="title"
          required
          placeholder="Ajouter une tâche…"
          className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2 font-body text-sm text-ink outline-none transition focus:border-corail"
        />
        <button
          disabled={pending}
          type="submit"
          className="rounded-full border border-ink px-4 py-2 font-label text-xs uppercase tracking-wide text-ink transition hover:border-corail hover:text-corail disabled:opacity-60"
        >
          {pending ? "Ajout…" : "Ajouter"}
        </button>
      </div>
      {state?.error && <p className="font-body text-xs text-corail">{state.error}</p>}
    </form>
  );
}
