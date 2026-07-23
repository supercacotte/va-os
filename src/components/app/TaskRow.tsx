"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useActionState } from "react";

import { deleteTaskAction, renameTaskAction, toggleTaskAction } from "@/lib/actions/tasks";
import { quickStartTimerAction, stopTimerAction } from "@/lib/actions/timeEntries";

type Props = {
  task: { id: string; title: string; done: boolean; source: string };
  clientId: string;
  timerActive?: boolean;
};

export default function TaskRow({ task, clientId, timerActive = false }: Props) {
  const [editing, setEditing] = useState(false);
  // Pas de <form> pour la checkbox : le reset automatique des formulaires
  // après une action (React 19) écraserait son état. Action directe +
  // useOptimistic pour un retour visuel immédiat.
  const [optimisticDone, setOptimisticDone] = useOptimistic(task.done);
  const [togglePending, startToggle] = useTransition();
  const [renameState, renameAction, renamePending] = useActionState(
    async (...args: Parameters<typeof renameTaskAction>) => {
      const result = await renameTaskAction(...args);
      if (!result?.error) setEditing(false);
      return result;
    },
    undefined,
  );

  function toggle() {
    startToggle(async () => {
      setOptimisticDone(!optimisticDone);
      const formData = new FormData();
      formData.set("taskId", task.id);
      formData.set("clientId", clientId);
      await toggleTaskAction(formData);
    });
  }

  return (
    <li className="group flex flex-col gap-1 rounded-[10px] px-2 py-1.5 transition hover:bg-paper/60">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={optimisticDone}
          disabled={togglePending}
          onChange={toggle}
          aria-label={`Marquer « ${task.title} » comme ${optimisticDone ? "à faire" : "faite"}`}
          className="h-4 w-4 accent-ink"
        />

        {editing ? (
          <form action={renameAction} className="flex min-w-0 flex-1 items-center gap-2">
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="clientId" value={clientId} />
            <label htmlFor={`edit-task-${task.id}`} className="sr-only">
              Nouveau titre
            </label>
            <input
              id={`edit-task-${task.id}`}
              name="title"
              defaultValue={task.title}
              autoFocus
              required
              className="min-w-0 flex-1 rounded-[10px] bg-paper px-3 py-1.5 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
            />
            <button
              disabled={renamePending}
              type="submit"
              className="rounded-lg bg-orange px-2.5 py-1 text-xs font-bold text-ink shadow-sticker disabled:opacity-60"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs font-semibold text-ink/60 transition hover:text-ink"
            >
              Annuler
            </button>
          </form>
        ) : (
          <>
            <span
              className={`min-w-0 flex-1 truncate text-[13px] font-medium text-ink ${
                optimisticDone ? "line-through opacity-60" : ""
              }`}
            >
              {task.title}
              {task.source === "client_request" && (
                <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold text-ink">
                  demande client
                </span>
              )}
            </span>
            {timerActive && (
              <form action={stopTimerAction} className="shrink-0">
                <input type="hidden" name="clientId" value={clientId} />
                <button
                  type="submit"
                  className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-paper transition hover:opacity-80"
                >
                  ■ Stop
                </button>
              </form>
            )}
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
              {!timerActive && !task.done && (
                <form action={quickStartTimerAction}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="clientId" value={clientId} />
                  <button
                    type="submit"
                    title="Lancer le chrono sur cette tâche"
                    className="rounded-full px-2 py-1 text-xs font-bold text-ink/60 transition hover:text-ink"
                  >
                    ▶ Chrono
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full px-2 py-1 text-xs font-semibold text-ink/50 transition hover:text-ink"
              >
                Éditer
              </button>
              <form
                action={deleteTaskAction}
                onSubmit={(e) => {
                  if (!confirm(`Supprimer la tâche « ${task.title} » ?`)) e.preventDefault();
                }}
              >
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="clientId" value={clientId} />
                <button
                  type="submit"
                  className="rounded-full px-2 py-1 text-xs font-semibold text-ink/50 transition hover:text-ink"
                >
                  Suppr.
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      {renameState?.error && (
        <p className="pl-7 text-xs font-semibold text-ink/70">{renameState.error}</p>
      )}
    </li>
  );
}
