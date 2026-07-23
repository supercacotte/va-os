"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";

import { startTimerAction } from "@/lib/actions/timeEntries";

// Shape renvoyée par getTasksForVa — utilisée aussi par TimeEntryRow pour le
// rattachement d'une entrée.
export type TaskOption = {
  id: string;
  title: string;
  done: boolean;
  mission: { name: string; client: { id: string; name: string } };
};

export type TimerClientOption = {
  id: string;
  name: string;
  tasks: { id: string; title: string; missionName: string }[];
};

type Props = {
  clients: TimerClientOption[];
  defaultClientId?: string;
  layout?: "row" | "column";
};

// Démarrage en deux temps : on choisit d'abord le client, puis une de SES
// tâches — le select de tâches se filtre en cascade.
export default function StartTimerForm({ clients, defaultClientId, layout = "row" }: Props) {
  const [clientId, setClientId] = useState(
    () => defaultClientId ?? (clients.length === 1 ? clients[0].id : ""),
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (...args: Parameters<typeof startTimerAction>) => {
      const result = await startTimerAction(...args);
      if (!result?.error) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  const selectedClient = clients.find((client) => client.id === clientId);
  const tasks = selectedClient?.tasks ?? [];

  const fieldClass =
    "min-w-0 rounded-full border border-line bg-cream px-4 py-2.5 font-body text-sm text-ink outline-none transition focus:border-corail disabled:opacity-60";

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-paper p-5"
    >
      <h2 className="font-display text-lg text-ink">Lancer un chrono</h2>
      <div className={layout === "row" ? "flex flex-wrap items-center gap-2" : "flex flex-col gap-2"}>
        <label htmlFor="timer-client" className="sr-only">
          Client
        </label>
        <select
          id="timer-client"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          required
          className={`${fieldClass} ${layout === "row" ? "flex-1" : "w-full"}`}
        >
          <option value="" disabled>
            1. Choisis un client…
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.tasks.length === 0 ? " (aucune tâche à faire)" : ""}
            </option>
          ))}
        </select>

        <label htmlFor="timer-task" className="sr-only">
          Tâche
        </label>
        <select
          id="timer-task"
          name="taskId"
          key={clientId}
          required
          disabled={!selectedClient || tasks.length === 0}
          defaultValue=""
          className={`${fieldClass} ${layout === "row" ? "flex-1" : "w-full"}`}
        >
          <option value="" disabled>
            {!selectedClient
              ? "2. Puis une tâche…"
              : tasks.length === 0
                ? "Aucune tâche à faire pour ce client"
                : "2. Puis une tâche…"}
          </option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.missionName} — {task.title}
            </option>
          ))}
        </select>

        <input type="hidden" name="clientId" value={clientId} />
        <label htmlFor="timer-label" className="sr-only">
          Label (optionnel)
        </label>
        <input
          id="timer-label"
          name="label"
          placeholder="Label (optionnel)"
          className={`${fieldClass} ${layout === "row" ? "flex-1" : "w-full"}`}
        />
        <button
          disabled={pending || tasks.length === 0}
          type="submit"
          className={`rounded-full bg-corail px-5 py-2.5 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60 ${
            layout === "column" ? "w-full" : ""
          }`}
        >
          {pending ? "Démarrage…" : "▶ Démarrer"}
        </button>
      </div>
      {state?.error && <p className="font-body text-xs text-corail">{state.error}</p>}
    </form>
  );
}
