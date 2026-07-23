"use client";

import { useState } from "react";
import { useActionState } from "react";

import {
  deleteMissionAction,
  renameMissionAction,
  setMissionStatusAction,
} from "@/lib/actions/missions";

type Props = {
  mission: { id: string; name: string; status: string; clientId: string };
  children: React.ReactNode;
};

export default function MissionCard({ mission, children }: Props) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction, renamePending] = useActionState(
    async (...args: Parameters<typeof renameMissionAction>) => {
      const result = await renameMissionAction(...args);
      if (!result?.error) setEditing(false);
      return result;
    },
    undefined,
  );

  const isDone = mission.status === "done";

  return (
    <article
      className={`rounded-3xl border p-6 ${
        isDone ? "border-dashed border-muted/50 bg-paper/60" : "border-line bg-paper"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {editing ? (
          <form action={renameAction} className="flex min-w-0 flex-1 items-center gap-2">
            <input type="hidden" name="missionId" value={mission.id} />
            <input type="hidden" name="clientId" value={mission.clientId} />
            <label htmlFor={`rename-${mission.id}`} className="sr-only">
              Nouveau nom
            </label>
            <input
              id={`rename-${mission.id}`}
              name="name"
              defaultValue={mission.name}
              autoFocus
              required
              className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2 font-body text-sm text-ink outline-none transition focus:border-corail"
            />
            <button
              disabled={renamePending}
              type="submit"
              className="rounded-full bg-corail px-4 py-2 font-label text-xs uppercase tracking-wide text-paper transition hover:bg-ink disabled:opacity-60"
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
          <div className="flex min-w-0 items-center gap-3">
            <h3 className={`truncate font-display text-lg ${isDone ? "text-muted" : "text-ink"}`}>
              {mission.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-3 py-1 font-label text-[11px] uppercase tracking-wide ${
                isDone ? "bg-muted/15 text-muted" : "bg-mer/15 text-mer"
              }`}
            >
              {isDone ? "Terminée" : "En cours"}
            </span>
          </div>
        )}

        {!editing && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full px-3 py-1.5 font-label text-xs uppercase tracking-wide text-ink/60 transition hover:bg-cream hover:text-corail"
            >
              Renommer
            </button>

            <form action={setMissionStatusAction}>
              <input type="hidden" name="missionId" value={mission.id} />
              <input type="hidden" name="clientId" value={mission.clientId} />
              <input type="hidden" name="status" value={isDone ? "active" : "done"} />
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 font-label text-xs uppercase tracking-wide text-ink/60 transition hover:bg-cream hover:text-corail"
              >
                {isDone ? "Réactiver" : "Terminer"}
              </button>
            </form>

            <form
              action={deleteMissionAction}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Supprimer la mission « ${mission.name} » et toutes ses tâches ? Cette action est irréversible.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="missionId" value={mission.id} />
              <input type="hidden" name="clientId" value={mission.clientId} />
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 font-label text-xs uppercase tracking-wide text-corail/70 transition hover:bg-cream hover:text-corail"
              >
                Supprimer
              </button>
            </form>
          </div>
        )}
      </div>

      {renameState?.error && (
        <p className="mt-2 font-body text-xs text-corail">{renameState.error}</p>
      )}

      <div className="mt-4">{children}</div>
    </article>
  );
}
