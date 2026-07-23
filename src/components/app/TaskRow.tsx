"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useActionState } from "react";

import { deleteTaskAction, renameTaskAction, toggleTaskAction } from "@/lib/actions/tasks";

type Props = {
  task: { id: string; title: string; done: boolean; source: string };
  clientId: string;
};

export default function TaskRow({ task, clientId }: Props) {
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
    <li className="group flex flex-col gap-1 rounded-xl px-2 py-1.5 transition hover:bg-cream/70">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={optimisticDone}
          disabled={togglePending}
          onChange={toggle}
          aria-label={`Marquer « ${task.title} » comme ${optimisticDone ? "à faire" : "faite"}`}
          className="h-4 w-4 accent-corail"
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
              className="min-w-0 flex-1 rounded-full border border-line bg-cream px-3 py-1.5 font-body text-sm text-ink outline-none transition focus:border-corail"
            />
            <button
              disabled={renamePending}
              type="submit"
              className="font-label text-xs uppercase tracking-wide text-corail transition hover:text-ink"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="font-label text-xs uppercase tracking-wide text-muted transition hover:text-ink"
            >
              Annuler
            </button>
          </form>
        ) : (
          <>
            <span
              className={`min-w-0 flex-1 truncate font-body text-sm ${
                optimisticDone ? "text-muted line-through" : "text-ink"
              }`}
            >
              {task.title}
              {task.source === "client_request" && (
                <span className="ml-2 rounded-full bg-soleil/20 px-2 py-0.5 font-label text-[10px] uppercase tracking-wide text-muted-2">
                  Demande client
                </span>
              )}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full px-2 py-1 font-label text-[11px] uppercase tracking-wide text-ink/50 transition hover:text-corail"
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
                  className="rounded-full px-2 py-1 font-label text-[11px] uppercase tracking-wide text-corail/60 transition hover:text-corail"
                >
                  Suppr.
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      {renameState?.error && (
        <p className="pl-7 font-body text-xs text-corail">{renameState.error}</p>
      )}
    </li>
  );
}
