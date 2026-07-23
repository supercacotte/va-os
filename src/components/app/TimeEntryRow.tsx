"use client";

import { useState } from "react";
import { useActionState } from "react";

import { deleteTimeEntryAction, updateTimeEntryAction } from "@/lib/actions/timeEntries";
import { formatDuration } from "@/lib/format";
import type { TaskOption } from "@/components/app/StartTimerForm";

type Entry = {
  id: string;
  label: string | null;
  startedAt: string;
  endedAt: string;
  taskId: string;
  taskTitle: string;
  missionName: string;
  clientName: string;
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function TimeEntryRow({
  entry,
  tasks,
}: {
  entry: Entry;
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
      <li className="rounded-2xl border border-corail/40 bg-paper p-4">
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="entryId" value={entry.id} />
          <input
            type="hidden"
            name="tzOffset"
            value={new Date().getTimezoneOffset()}
          />
          <div className="flex flex-wrap gap-2">
            <label htmlFor={`task-${entry.id}`} className="sr-only">
              Tâche
            </label>
            <select
              id={`task-${entry.id}`}
              name="taskId"
              defaultValue={entry.taskId}
              className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2 font-body text-sm text-ink outline-none transition focus:border-corail"
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
              className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2 font-body text-sm text-ink outline-none transition focus:border-corail"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={`start-${entry.id}`}
              className="font-label text-[11px] uppercase tracking-wide text-muted"
            >
              Début
            </label>
            <input
              id={`start-${entry.id}`}
              name="startedAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(entry.startedAt)}
              required
              className="rounded-full border border-line bg-cream px-4 py-2 font-body text-sm text-ink outline-none transition focus:border-corail"
            />
            <label
              htmlFor={`duration-${entry.id}`}
              className="font-label text-[11px] uppercase tracking-wide text-muted"
            >
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
              className="w-24 rounded-full border border-line bg-cream px-4 py-2 font-body text-sm text-ink outline-none transition focus:border-corail"
            />
            <div className="ml-auto flex items-center gap-2">
              <button
                disabled={pending}
                type="submit"
                className="rounded-full bg-corail px-4 py-2 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
              >
                {pending ? "…" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="font-label text-xs uppercase tracking-wide text-muted transition hover:text-ink"
              >
                Annuler
              </button>
            </div>
          </div>
          {state?.error && <p className="font-body text-xs text-corail">{state.error}</p>}
        </form>
      </li>
    );
  }

  return (
    <li className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-medium text-ink">
          {entry.label ?? entry.taskTitle}
        </p>
        <p className="truncate font-body text-xs text-muted-2">
          {entry.clientName} — {entry.missionName}
          {entry.label ? ` — ${entry.taskTitle}` : ""}
        </p>
      </div>
      <p suppressHydrationWarning className="font-body text-xs text-muted">
        {new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(entry.startedAt))}
      </p>
      <p className="font-label text-sm tabular-nums text-ink">{formatDuration(durationMs)}</p>
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full px-2 py-1 font-label text-[11px] uppercase tracking-wide text-ink/50 transition hover:text-corail"
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
            className="rounded-full px-2 py-1 font-label text-[11px] uppercase tracking-wide text-corail/60 transition hover:text-corail"
          >
            Suppr.
          </button>
        </form>
      </div>
    </li>
  );
}
