"use client";

import { useRef } from "react";
import { useActionState } from "react";

import { startTimerAction } from "@/lib/actions/timeEntries";

export type TaskOption = {
  id: string;
  title: string;
  done: boolean;
  mission: { name: string; client: { name: string } };
};

export default function StartTimerForm({ tasks }: { tasks: TaskOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (...args: Parameters<typeof startTimerAction>) => {
      const result = await startTimerAction(...args);
      if (!result?.error) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  const openTasks = tasks.filter((task) => !task.done);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-paper p-6"
    >
      <h2 className="font-display text-lg text-ink">Lancer un chrono</h2>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="timer-task" className="sr-only">
          Tâche
        </label>
        <select
          id="timer-task"
          name="taskId"
          required
          defaultValue=""
          className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
        >
          <option value="" disabled>
            Choisis une tâche…
          </option>
          {openTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.mission.client.name} — {task.mission.name} — {task.title}
            </option>
          ))}
        </select>
        <label htmlFor="timer-label" className="sr-only">
          Label (optionnel)
        </label>
        <input
          id="timer-label"
          name="label"
          placeholder="Label (optionnel)"
          className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-corail"
        />
        <button
          disabled={pending}
          type="submit"
          className="rounded-full bg-corail px-5 py-3 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
        >
          {pending ? "Démarrage…" : "▶ Démarrer"}
        </button>
      </div>
      {state?.error && <p className="font-body text-xs text-corail">{state.error}</p>}
    </form>
  );
}
