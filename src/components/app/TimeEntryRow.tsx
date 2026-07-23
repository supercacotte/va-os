"use client";

import { useState } from "react";
import { useActionState } from "react";

import { deleteTimeEntryAction, updateTimeEntryAction } from "@/lib/actions/timeEntries";
import { formatDuration } from "@/lib/format";
import { clientColorVar } from "@/lib/client-colors";
import type { TaskOption } from "@/components/app/StartTimerForm";

export type HistoryEntry = {
  id: string;
  label: string | null;
  startedAt: string;
  endedAt: string;
  taskId: string;
  taskTitle: string;
  missionName: string;
  clientId: string;
  clientName: string;
  clientColor: number;
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const FIELD =
  "rounded-[10px] bg-paper px-4 py-2 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";

export default function TimeEntryRow({
  entry,
  tasks,
}: {
  entry: HistoryEntry;
  tasks: TaskOption[];
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    async (...args: Parameters<typeof updateTimeEntryAction>) => {
      const result = await updateTimeEntryAction(...args);
      if (result?.ok) setEditing(false);
      return result;
    },
    undefined,
  );

  const durationMs = Date.parse(entry.endedAt) - Date.parse(entry.startedAt);
  const durationMin = Math.max(1, Math.round(durationMs / 60000));

  if (editing) {
    return (
      <li className="rounded-[14px] border-2 border-ink bg-sand p-4">
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="entryId" value={entry.id} />
          <input type="hidden" name="tzOffset" value={new Date().getTimezoneOffset()} />
          <div className="flex flex-wrap gap-2">
            <label htmlFor={`task-${entry.id}`} className="sr-only">
              Tâche
            </label>
            <select
              id={`task-${entry.id}`}
              name="taskId"
              defaultValue={entry.taskId}
              className={`${FIELD} min-w-0 flex-1`}
            >
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.mission.client.name} — {task.mission.name} — {task.title}
                </option>
              ))}
            </select>
            <label htmlFor={`label-${entry.id}`} className="sr-only">
              Label
            </label>
            <input
              id={`label-${entry.id}`}
              name="label"
              defaultValue={entry.label ?? ""}
              placeholder="Label (optionnel)"
              className={`${FIELD} min-w-0 flex-1`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`start-${entry.id}`} className="text-xs font-bold text-ink">
              Début
            </label>
            <input
              id={`start-${entry.id}`}
              name="startedAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(entry.startedAt)}
              required
              className={FIELD}
            />
            <label htmlFor={`duration-${entry.id}`} className="text-xs font-bold text-ink">
              Durée (min)
            </label>
            <input
              id={`duration-${entry.id}`}
              name="durationMin"
              type="number"
              min={1}
              max={1440}
              defaultValue={durationMin}
              required
              className={`${FIELD} w-24`}
            />
            <div className="ml-auto flex items-center gap-2">
              <button
                disabled={pending}
                type="submit"
                className="rounded-xl bg-orange px-4 py-2 text-xs font-bold text-ink shadow-sticker disabled:opacity-60"
              >
                {pending ? "…" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs font-semibold text-ink/60 transition hover:text-ink"
              >
                Annuler
              </button>
            </div>
          </div>
          {state?.error && <p className="text-xs font-semibold text-ink/70">{state.error}</p>}
        </form>
      </li>
    );
  }

  return (
    <li className="group flex flex-wrap items-center gap-3 rounded-[14px] bg-sand px-5 py-3.5">
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: clientColorVar(entry.clientColor) }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">
          {entry.label ?? entry.taskTitle}
        </p>
        <p className="truncate text-[13px] font-medium text-ink opacity-70">
          {entry.clientName} · {entry.missionName}
          {entry.label ? ` · ${entry.taskTitle}` : ""}
        </p>
      </div>
      <p suppressHydrationWarning className="text-[13px] font-medium text-ink opacity-70">
        {new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(entry.startedAt))}
      </p>
      <p className="text-[15px] font-bold tabular-nums text-ink">
        {formatDuration(durationMs)}
      </p>
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full px-2 py-1 text-xs font-semibold text-ink/50 transition hover:text-ink"
        >
          Éditer
        </button>
        <form
          action={deleteTimeEntryAction}
          onSubmit={(e) => {
            if (!confirm("Supprimer cette entrée de temps ?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="entryId" value={entry.id} />
          <button
            type="submit"
            className="rounded-full px-2 py-1 text-xs font-semibold text-ink/50 transition hover:text-ink"
          >
            Suppr.
          </button>
        </form>
      </div>
    </li>
  );
}
