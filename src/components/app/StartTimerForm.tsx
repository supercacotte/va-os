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

// État repos du chrono (DESIGN.md §3) : zone en pointillés, timer fantôme,
// démarrage en deux temps — d'abord le client, puis une de SES tâches.
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
    "min-w-0 rounded-[10px] bg-sand px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30 disabled:opacity-60";

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-[18px] border-2 border-dashed border-ink/30 p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-bold text-ink">Lancer un chrono</h2>
        <span className="rotate-2 rounded-full bg-sand px-2.5 py-1 text-xs font-bold text-ink">
          à l&apos;arrêt
        </span>
      </div>

      {layout === "column" && (
        <p className="font-bowlby text-[38px] leading-none text-ink opacity-20">00:00:00</p>
      )}

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
          className={`rounded-xl bg-orange px-5 py-3 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60 ${
            layout === "column" ? "w-full" : ""
          }`}
        >
          {pending ? "Démarrage…" : "▶ Démarrer"}
        </button>
      </div>
      {state?.error && <p className="text-xs font-semibold text-ink/70">{state.error}</p>}
    </form>
  );
}
