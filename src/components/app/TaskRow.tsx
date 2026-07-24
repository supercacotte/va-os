"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { useActionState } from "react";

import { deleteTaskAction, renameTaskAction, toggleTaskAction } from "@/lib/actions/tasks";
import { quickStartTimerAction, stopTimerAction } from "@/lib/actions/timeEntries";
import { clientColorVar } from "@/lib/client-colors";
import { duePhrase, isOverdue } from "@/lib/dates";
import { formatClock } from "@/lib/format";

type Props = {
  task: {
    id: string;
    title: string;
    done: boolean;
    source: string;
    recurring?: string | null;
    due?: string | null;
  };
  clientId: string;
  clientColor?: number;
  timerActive?: boolean;
  timerStartedAt?: string | null;
};

// « Des mots, pas de pictos » (maquette 29a) : les actions sont des
// micro-pills texte visibles au survol, la récurrence une simple mention.
const PILL_PAPER =
  "rounded-full bg-paper px-3 py-1 text-[11px] font-bold text-ink shadow-sticker transition hover:brightness-95";
const PILL_INK =
  "rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-paper transition hover:opacity-85";

// Badge « ● 00:12:41 » : version miniature du chrono, seconde par seconde.
function TimerBadge({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      suppressHydrationWarning
      className="-rotate-2 rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold tabular-nums text-ink shadow-sticker"
    >
      ● {formatClock(Math.max(0, now - Date.parse(startedAt)))}
    </span>
  );
}

export default function TaskRow({
  task,
  clientId,
  clientColor,
  timerActive = false,
  timerStartedAt = null,
}: Props) {
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
    <li
      className={`group flex flex-col gap-1 rounded-[12px] px-3 py-2 transition ${
        timerActive ? "" : "hover:bg-paper/60"
      }`}
      style={
        timerActive && clientColor ? { backgroundColor: clientColorVar(clientColor) } : undefined
      }
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={optimisticDone}
          disabled={togglePending}
          onClick={toggle}
          aria-label={`Marquer « ${task.title} » comme ${optimisticDone ? "à faire" : "faite"}`}
          className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 border-ink transition ${
            optimisticDone ? "bg-ink text-paper" : "bg-paper hover:bg-sand"
          }`}
        >
          {optimisticDone && <span className="text-[12px] font-bold leading-none">✓</span>}
        </button>

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
            <label htmlFor={`edit-due-${task.id}`} className="sr-only">
              Échéance (optionnelle)
            </label>
            <input
              id={`edit-due-${task.id}`}
              name="dueDate"
              type="date"
              defaultValue={task.due ? task.due.slice(0, 10) : ""}
              className="rounded-[10px] bg-paper px-2.5 py-1.5 text-[12px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
            />
            <button
              disabled={renamePending}
              type="submit"
              className="rounded-full bg-orange px-3 py-1 text-[11px] font-bold text-ink shadow-sticker disabled:opacity-60"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-[11px] font-semibold text-ink/60 transition hover:text-ink"
            >
              annuler
            </button>
          </form>
        ) : (
          <>
            {/* Les mentions vivent hors du span tronqué : un titre long ne
                doit jamais avaler l'échéance ni la récurrence. */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={`min-w-0 truncate text-[14px] font-medium text-ink ${
                  optimisticDone ? "line-through opacity-50" : ""
                }`}
              >
                {task.title}
              </span>
              {task.source === "client_request" && (
                <span className="shrink-0 rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold text-ink/60">
                  demande client
                </span>
              )}
              {task.recurring && (
                <span className="shrink-0 rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold text-ink/60">
                  {task.recurring === "weekly" ? "hebdo" : "mensuelle"}
                </span>
              )}
              {task.due && !optimisticDone && (
                // D19 : l'échéance en mots. Dépassée = sticker tomato penché,
                // le seul rouge de l'app — il doit sauter aux yeux.
                <span
                  suppressHydrationWarning
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isOverdue(task.due)
                      ? "-rotate-2 bg-tomato px-2.5 py-1 text-ink shadow-sticker"
                      : "bg-paper text-ink/60"
                  }`}
                >
                  {isOverdue(task.due) ? "en retard — " : "pour "}
                  {duePhrase(task.due)}
                </span>
              )}
            </div>

            {timerActive ? (
              <div className="flex shrink-0 items-center gap-2">
                {timerStartedAt && <TimerBadge startedAt={timerStartedAt} />}
                <form action={stopTimerAction}>
                  <input type="hidden" name="clientId" value={clientId} />
                  <button type="submit" className={PILL_INK}>
                    stop
                  </button>
                </form>
              </div>
            ) : (
              <>
                {optimisticDone && (
                  <span className="shrink-0 rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-ink">
                    fait ✓
                  </span>
                )}
                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  {!optimisticDone && (
                    <form action={quickStartTimerAction}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="clientId" value={clientId} />
                      <button
                        type="submit"
                        title="Lancer le chrono sur cette tâche"
                        className={PILL_PAPER}
                      >
                        chrono
                      </button>
                    </form>
                  )}
                  <button type="button" onClick={() => setEditing(true)} className={PILL_INK}>
                    éditer
                  </button>
                  <form
                    action={deleteTaskAction}
                    onSubmit={(e) => {
                      if (!confirm(`Supprimer la tâche « ${task.title} » ?`)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="clientId" value={clientId} />
                    <button type="submit" className={PILL_PAPER}>
                      suppr.
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        )}
      </div>
      {renameState?.error && (
        <p className="pl-9 text-xs font-semibold text-ink/70">{renameState.error}</p>
      )}
    </li>
  );
}
