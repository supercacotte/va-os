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
          className="min-w-[160px] flex-1 rounded-[10px] bg-paper px-4 py-2.5 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
        />
        <label htmlFor={`recurrence-${missionId}`} className="sr-only">
          Récurrence
        </label>
        {/* D19 : échéance optionnelle (ignorée pour une récurrence : chaque
            occurrence reçoit la sienne, fin de semaine ou fin de mois) */}
        <label htmlFor={`due-${missionId}`} className="sr-only">
          Échéance (optionnelle)
        </label>
        <input
          id={`due-${missionId}`}
          name="dueDate"
          type="date"
          className="rounded-full bg-paper px-3.5 py-2 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
        />
        {/* Pill « une fois ▾ » (29a) — la flèche est la nôtre, pas celle du navigateur */}
        <span className="relative">
          <select
            id={`recurrence-${missionId}`}
            name="recurrence"
            defaultValue="none"
            className="appearance-none rounded-full bg-paper py-2.5 pl-4 pr-8 text-[13px] font-bold text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
          >
            <option value="none">une fois</option>
            <option value="weekly">chaque semaine</option>
            <option value="monthly">chaque mois</option>
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink"
          >
            ▾
          </span>
        </span>
        <button
          disabled={pending}
          type="submit"
          className="rounded-xl bg-orange px-4 py-2.5 text-[13px] font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Ajout…" : "+ Ajouter"}
        </button>
      </div>
      {state?.error && <p className="text-xs font-semibold text-ink/70">{state.error}</p>}
    </form>
  );
}
